import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Animated, 
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Income, incomeApi } from '../api/incomeApi';
import { useAuth } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INCOME_CATEGORIES, IncomeCategory } from '../constants/categories';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type IconName = 'cash-outline' | 'laptop-outline' | 'trending-up-outline' | 'home-outline' | 'briefcase-outline' | 'ellipsis-horizontal-outline';

type SortOption = 'date' | 'amount';
type FilterTimeframe = 'all' | 'year';

const IncomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] = useState<FilterTimeframe>('year');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newIncome, setNewIncome] = useState({
    title: '',
    amount: '',
    category: '',
    remarks: '',
    incomeDate: new Date().toISOString().split('T')[0],
  });

  const formSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const filterSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incomes, selectedYear, selectedTimeframe, selectedCategories, sortBy, sortAscending, searchQuery]);

  const loadInitialData = async () => {
    try {
      // Load saved filters
      const savedFilters = await AsyncStorage.getItem('income_filters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        setSelectedTimeframe(filters.timeframe || 'year');
        setSelectedYear(filters.year || new Date().getFullYear().toString());
        setSelectedCategories(filters.categories || []);
        setSortBy(filters.sortBy || 'date');
        setSortAscending(filters.sortAscending || false);
      }
      await fetchIncomes();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const saveFilters = async () => {
    try {
      await AsyncStorage.setItem('income_filters', JSON.stringify({
        timeframe: selectedTimeframe,
        year: selectedYear,
        categories: selectedCategories,
        sortBy,
        sortAscending,
      }));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...incomes];

    // Apply year filter only if not showing all records
    if (selectedTimeframe === 'year') {
      filtered = filtered.filter(income => {
        const incomeDate = new Date(income.incomeDate);
        return incomeDate.getFullYear().toString() === selectedYear;
      });
    }
    // For 'all', we don't apply any date filtering

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(income => 
        selectedCategories.includes(income.category)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(income => 
        income.title.toLowerCase().includes(query) ||
        income.category.toLowerCase().includes(query) ||
        (income.remarks?.toLowerCase() || '').includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortAscending
          ? new Date(a.incomeDate).getTime() - new Date(b.incomeDate).getTime()
          : new Date(b.incomeDate).getTime() - new Date(a.incomeDate).getTime();
      } else {
        return sortAscending
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });

    setFilteredIncomes(filtered);
  };

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const userDataStr = await AsyncStorage.getItem('email_verification_status');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};

      if (!userData?.userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }
      const data = await incomeApi.getAllIncomes(userData?.userId || null);
      setIncomes(data);
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
      Alert.alert(
        'Error',
        'Failed to fetch incomes. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowFilters = () => {
    setShowFilters(true);
    Animated.spring(filterSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseFilters = () => {
    Animated.spring(filterSlideAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
    }).start(() => setShowFilters(false));
  };

  const handleApplyFilters = async () => {
    await saveFilters();
    handleCloseFilters();
  };

  const handleResetFilters = () => {
    const currentYear = new Date().getFullYear().toString();
    setSelectedTimeframe('year');
    setSelectedYear(currentYear);
    setSelectedCategories([]);
    setSortBy('date');
    setSortAscending(false);
    setSearchQuery('');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddIncome = async () => {
    try {
      if (!newIncome.title || !newIncome.amount || !newIncome.category) {
        Alert.alert(
          'Missing Information',
          'Please fill in all required fields (title, amount, and category).',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!user?.id) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      setLoading(true);
      await incomeApi.addIncome({
        userId: user.id,
        title: newIncome.title,
        amount: parseFloat(newIncome.amount),
        incomeDate: newIncome.incomeDate,
        category: newIncome.category,
        remarks: newIncome.remarks,
      });

      setNewIncome({
        title: '',
        amount: '',
        category: '',
        remarks: '',
        incomeDate: new Date().toISOString().split('T')[0],
      });
      handleCloseAddForm();
      fetchIncomes();
      Alert.alert(
        'Success',
        'Income added successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to add income:', error);
      Alert.alert(
        'Error',
        'Failed to add income. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
    Animated.spring(formSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseAddForm = () => {
    Animated.spring(formSlideAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
    }).start(() => setShowAddForm(false));
  };

  const getHeaderTitle = () => {
    if (selectedTimeframe === 'all') {
      return 'All Income';
    } else {
      return `Income ${selectedYear}`;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <TouchableOpacity onPress={handleShowFilters}>
          <Ionicons name="options" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* <View style={styles.filterChips}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.chip, sortBy === 'date' && styles.activeChip]}
            onPress={() => {
              if (sortBy === 'date') {
                setSortAscending(!sortAscending);
              } else {
                setSortBy('date');
                setSortAscending(false);
              }
            }}
          >
            <Text style={[styles.chipText, sortBy === 'date' && styles.activeChipText]}>
              Date {sortBy === 'date' && (sortAscending ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.chip, sortBy === 'amount' && styles.activeChip]}
            onPress={() => {
              if (sortBy === 'amount') {
                setSortAscending(!sortAscending);
              } else {
                setSortBy('amount');
                setSortAscending(false);
              }
            }}
          >
            <Text style={[styles.chipText, sortBy === 'amount' && styles.activeChipText]}>
              Amount {sortBy === 'amount' && (sortAscending ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>

          {selectedCategories.map(category => (
            <TouchableOpacity 
              key={category}
              style={[styles.chip, styles.activeChip]}
              onPress={() => toggleCategory(category)}
            >
              <Text style={[styles.chipText, styles.activeChipText]}>
                {category} ×
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> */}
    </View>
  );

  const renderSummary = () => {
    const total = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
    const count = filteredIncomes.length;

    // Calculate monthly breakdown for the selected year
    const monthlyData = filteredIncomes.reduce((acc, income) => {
      const month = new Date(income.incomeDate).getMonth();
      acc[month] = (acc[month] || 0) + income.amount;
      return acc;
    }, {} as Record<number, number>);

    // Find best and worst months
    type MonthAmount = { month: number; amount: number };
    const monthEntries = Object.entries(monthlyData).map(([month, amount]) => ({
      month: parseInt(month),
      amount
    }));

    const bestMonth = monthEntries.length > 0 
      ? monthEntries.reduce((max, current) => 
          current.amount > max.amount ? current : max
        , monthEntries[0])
      : null;

    const worstMonth = monthEntries.length > 0
      ? monthEntries.reduce((min, current) => 
          current.amount < min.amount ? current : min
        , monthEntries[0])
      : null;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Calculate average monthly income
    const monthlyAverage = monthEntries.length > 0 
      ? total / monthEntries.length 
      : 0;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          {/* Total Income Section */}
          <View style={styles.totalIncomeSection}>
            <Text style={styles.totalIncomeLabel}>Total Income</Text>
            <Text style={styles.totalIncomeValue}>₹{total.toLocaleString()}</Text>
            <Text style={styles.periodLabel}>
              {selectedTimeframe === 'year' 
                ? selectedYear 
                : 'Current Year'}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <View style={styles.statsIconContainer}>
                <Ionicons name="calendar" size={20} color="#007AFF" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Monthly Avg</Text>
                <Text style={styles.statsValue}>₹{monthlyAverage.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.statsItem}>
              <View style={styles.statsIconContainer}>
                <Ionicons name="receipt" size={20} color="#007AFF" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Transactions</Text>
                <Text style={styles.statsValue}>{count}</Text>
              </View>
            </View>
          </View>

          {/* Monthly Performance */}
          {/* {bestMonth && worstMonth && selectedTimeframe === 'year' && (
            <View style={styles.monthlyPerformance}>
              <View style={styles.performanceHeader}>
                <Ionicons name="stats-chart" size={20} color="#666" />
                <Text style={styles.performanceTitle}>Monthly Performance</Text>
              </View>
              
              <View style={styles.performanceGrid}>
                <View style={styles.performanceItem}>
                  <View style={[styles.performanceIcon, styles.bestMonthIcon]}>
                    <Ionicons name="trending-up" size={20} color="#34C759" />
                  </View>
                  <View style={styles.performanceTextContainer}>
                    <Text style={styles.performanceLabel}>Best Month</Text>
                    <Text style={styles.performanceMonth}>
                      {monthNames[bestMonth.month]}
                    </Text>
                    <Text style={[styles.performanceAmount, styles.bestMonthText]}>
                      ₹{bestMonth.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.performanceDivider} />

                <View style={styles.performanceItem}>
                  <View style={[styles.performanceIcon, styles.worstMonthIcon]}>
                    <Ionicons name="trending-down" size={20} color="#FF3B30" />
                  </View>
                  <View style={styles.performanceTextContainer}>
                    <Text style={styles.performanceLabel}>Worst Month</Text>
                    <Text style={styles.performanceMonth}>
                      {monthNames[worstMonth.month]}
                    </Text>
                    <Text style={[styles.performanceAmount, styles.worstMonthText]}>
                      ₹{worstMonth.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )} */}
        </View>
      </View>
    );
  };

  const renderTransactionItem = ({ item: income }: { item: Income }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: '#007AFF20' }]}>
          <Ionicons 
            name={INCOME_CATEGORIES.find(c => c.name === income.category)?.icon || 'ellipsis-horizontal'} 
            size={24} 
            color="#007AFF" 
          />
        </View>
        <View>
          <Text style={styles.transactionTitle}>{income.title}</Text>
          <Text style={styles.transactionCategory}>{income.category}</Text>
          {income.remarks && (
            <Text style={styles.transactionRemarks}>{income.remarks}</Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>₹{income.amount.toLocaleString()}</Text>
        <Text style={styles.transactionDate}>
          {new Date(income.incomeDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
          })}
        </Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="none"
      onRequestClose={handleCloseFilters}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <Animated.View 
          style={[
            styles.filterContainer,
            { transform: [{ translateY: filterSlideAnim }] }
          ]}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Income</Text>
            <TouchableOpacity onPress={handleCloseFilters}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Period</Text>
              <View style={styles.timeframeButtons}>
                {(['year', 'all'] as FilterTimeframe[]).map(timeframe => (
                  <TouchableOpacity
                    key={timeframe}
                    style={[
                      styles.timeframeButton,
                      selectedTimeframe === timeframe && styles.selectedTimeframe
                    ]}
                    onPress={() => setSelectedTimeframe(timeframe)}
                  >
                    <Text style={[
                      styles.timeframeButtonText,
                      selectedTimeframe === timeframe && styles.selectedTimeframeText
                    ]}>
                      {timeframe === 'all' ? 'All Records' : 'Current Year'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedTimeframe === 'year' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Select Year</Text>
                <View style={styles.yearSelector}>
                  <TextInput
                    style={styles.yearInput}
                    value={selectedYear}
                    onChangeText={setSelectedYear}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholder="YYYY"
                  />
                </View>
              </View>
            )}

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.categoryGrid}>
                {INCOME_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategories.includes(category.name) && styles.selectedCategory
                    ]}
                    onPress={() => toggleCategory(category.name)}
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={24} 
                      color={selectedCategories.includes(category.name) ? '#fff' : '#007AFF'} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategories.includes(category.name) && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortBy === 'date' && styles.selectedSort
                  ]}
                  onPress={() => setSortBy('date')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === 'date' && styles.selectedSortText
                  ]}>Date</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortBy === 'amount' && styles.selectedSort
                  ]}
                  onPress={() => setSortBy('amount')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === 'amount' && styles.selectedSortText
                  ]}>Amount</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sortOrderButtons}>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    !sortAscending && styles.selectedSortOrder
                  ]}
                  onPress={() => setSortAscending(false)}
                >
                  <Text style={[
                    styles.sortOrderButtonText,
                    !sortAscending && styles.selectedSortOrderText
                  ]}>Highest First</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    sortAscending && styles.selectedSortOrder
                  ]}
                  onPress={() => setSortAscending(true)}
                >
                  <Text style={[
                    styles.sortOrderButtonText,
                    sortAscending && styles.selectedSortOrderText
                  ]}>Lowest First</Text>
                </TouchableOpacity>
              </View>
            </View> */}
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderAddIncomeForm = () => (
    <Modal
      visible={showAddForm}
      transparent
      animationType="none"
      onRequestClose={handleCloseAddForm}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { transform: [{ translateY: formSlideAnim }] }
          ]}
        >
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add Income</Text>
            <TouchableOpacity onPress={handleCloseAddForm}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={newIncome.title}
                onChangeText={(text) => setNewIncome(prev => ({ ...prev, title: text }))}
                placeholder="Income title"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Amount</Text>
              <TextInput
                style={styles.formInput}
                value={newIncome.amount}
                onChangeText={(text) => setNewIncome(prev => ({ ...prev, amount: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.formInput}
                value={newIncome.incomeDate}
                onChangeText={(text) => setNewIncome(prev => ({ ...prev, incomeDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {INCOME_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      newIncome.category === category.name && styles.selectedCategory
                    ]}
                    onPress={() => setNewIncome(prev => ({ ...prev, category: category.name }))}
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={24} 
                      color={newIncome.category === category.name ? '#fff' : '#007AFF'} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      newIncome.category === category.name && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Remarks (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newIncome.remarks}
                onChangeText={(text) => setNewIncome(prev => ({ ...prev, remarks: text }))}
                placeholder="Add notes..."
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.formActions}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddIncome}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add Income</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading && !showAddForm && !showFilters) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        {renderSummary()}
        <FlatList
          data={filteredIncomes}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleShowAddForm}
        activeOpacity={0.8}
      >
        <View style={styles.fabBackground}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      {renderFilters()}
      {renderAddIncomeForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterChips: {
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  activeChipText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalIncomeSection: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  totalIncomeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalIncomeValue: {
    fontSize: 32,
    fontWeight: '600',
    color: 'green',
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  monthlyPerformance: {
    paddingTop: 20,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  performanceGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  performanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  performanceDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bestMonthIcon: {
    backgroundColor: '#34C75920',
  },
  worstMonthIcon: {
    backgroundColor: '#FF3B3020',
  },
  performanceTextContainer: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  performanceMonth: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  performanceAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  bestMonthText: {
    color: '#34C759',
  },
  worstMonthText: {
    color: '#FF3B30',
  },
  transactionsList: {
    padding: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
  },
  transactionRemarks: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  fabBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 20,
  },
  filterSectionLast: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  timeframeButtons: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTimeframeButton: {
    backgroundColor: '#007AFF',
  },
  timeframeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTimeframeButtonText: {
    color: '#fff',
  },
  yearScrollContent: {
    paddingVertical: 5,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedYearButton: {
    backgroundColor: '#007AFF',
  },
  yearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedYearButtonText: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 10,
    minWidth: '45%',
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInputContainer: {
    flex: 1,
  },
  amountInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  amountInputDivider: {
    width: 20,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
    marginTop: 20,
  },
  filterActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  formContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 5,
    minWidth: '45%',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  formActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedTimeframe: {
    backgroundColor: '#007AFF',
  },
  selectedTimeframeText: {
    color: '#fff',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sortButtons: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedSort: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedSortText: {
    color: '#fff',
  },
  sortOrderButtons: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  sortOrderButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedSortOrder: {
    backgroundColor: '#007AFF',
  },
  sortOrderButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedSortOrderText: {
    color: '#fff',
  },
});

export default IncomeScreen; 