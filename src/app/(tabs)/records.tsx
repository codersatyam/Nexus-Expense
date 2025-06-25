import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchExpenses, Expense } from '../../api/expenseApi';
import { categories, Category, categoryTags, CategoryTag } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecordsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDateFilter, setSelectedDateFilter] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  // Date filter options
  const dateFilterOptions = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'lastWeek', label: 'Last Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'lastYear', label: 'Last Year' },
    { id: 'all', label: 'All Time' },
  ];

  // Fetch expenses from API
  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userDataStr = await AsyncStorage.getItem('email_verification_status');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      const data = await fetchExpenses(userData?.userId);
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load expenses on component mount
  useEffect(() => {
    console.log('🚀 RecordsScreen mounted, loading expenses...');
    loadExpenses();
  }, []);

  // Filter expenses based on selected filters
  useEffect(() => {
    console.log('🔍 Filtering expenses...');
    console.log('📊 Total expenses in state:', expenses.length);
    console.log('📅 Selected date filter:', selectedDateFilter);
    console.log('🏷️ Selected category:', selectedCategory);
    console.log('🏷️ Selected tag:', selectedTag);
    
    let filtered = [...expenses];

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (selectedDateFilter) {
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        console.log('📅 Today filter: from', today.toISOString(), 'to', tomorrow.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= today && expenseDate < tomorrow;
        });
        break;
      case 'yesterday':
        console.log('📅 Yesterday filter: from', yesterday.toISOString(), 'to', today.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= yesterday && expenseDate < today;
        });
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const endOfWeekNext = new Date(endOfWeek);
        endOfWeekNext.setDate(endOfWeek.getDate() + 1);
        console.log('📅 This Week filter: from', startOfWeek.toISOString(), 'to', endOfWeekNext.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= startOfWeek && expenseDate < endOfWeekNext;
        });
        break;
      case 'lastWeek':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        const endOfLastWeekNext = new Date(endOfLastWeek);
        endOfLastWeekNext.setDate(endOfLastWeek.getDate() + 1);
        console.log('📅 Last Week filter: from', startOfLastWeek.toISOString(), 'to', endOfLastWeekNext.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= startOfLastWeek && expenseDate < endOfLastWeekNext;
        });
        break;
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const endOfMonthNext = new Date(endOfMonth);
        endOfMonthNext.setDate(endOfMonth.getDate() + 1);
        console.log('📅 This Month filter: from', startOfMonth.toISOString(), 'to', endOfMonthNext.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= startOfMonth && expenseDate < endOfMonthNext;
        });
        break;
      case 'lastMonth':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const endOfLastMonthNext = new Date(endOfLastMonth);
        endOfLastMonthNext.setDate(endOfLastMonth.getDate() + 1);
        console.log('📅 Last Month filter: from', startOfLastMonth.toISOString(), 'to', endOfLastMonthNext.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= startOfLastMonth && expenseDate < endOfLastMonthNext;
        });
        break;
      case 'thisYear':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const endOfYearNext = new Date(endOfYear);
        endOfYearNext.setDate(endOfYear.getDate() + 1);
        console.log('📅 This Year filter: from', startOfYear.toISOString(), 'to', endOfYearNext.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= startOfYear && expenseDate < endOfYearNext;
        });
        break;
      case 'lastYear':
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
        const endOfLastYearNext = new Date(endOfLastYear);
        endOfLastYearNext.setDate(endOfLastYear.getDate() + 1);
        console.log('📅 Last Year filter: from', startOfLastYear.toISOString(), 'to', endOfLastYearNext.toISOString());
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= startOfLastYear && expenseDate < endOfLastYearNext;
        });
        break;
      case 'all':
        console.log('📅 All Time filter: showing all expenses');
        // No filtering needed - show all expenses
        break;
    }

    console.log('📅 After date filtering:', filtered.length, 'expenses');

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
      console.log('🏷️ After category filtering:', filtered.length, 'expenses');
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(expense => expense.tag === selectedTag);
      console.log('🏷️ After tag filtering:', filtered.length, 'expenses');
    }

    console.log('✅ Final filtered expenses:', filtered.length);
    setFilteredExpenses(filtered);
  }, [expenses, selectedDateFilter, selectedCategory, selectedTag]);

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals = categories
    .map((category: Category) => {
      const categoryExpenses = filteredExpenses.filter(expense => expense.category === category.name);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        category: category.name,
        total,
        count: categoryExpenses.length,
        color: category.color,
        icon: category.icon,
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.total - a.total);

  const getAvailableTags = () => {
    if (!selectedCategory) return [];
    const categoryExpenses = filteredExpenses.filter(expense => expense.category === selectedCategory);
    const tags = [...new Set(categoryExpenses.map(expense => expense.tag))];
    return tags.filter(tag => tag && tag.trim() !== '');
  };

  const tagTotals = getAvailableTags()
    .map(tag => {
      const tagExpenses = filteredExpenses.filter(expense => expense.tag === tag);
      const total = tagExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        tag,
        total,
        count: tagExpenses.length,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Handler functions
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedTag(''); // Reset tag when category changes
    setShowCategoryModal(false);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setShowTagModal(false);
  };

  const handleAddExpense = () => {
    router.push('/add-expense');
  };

  // Debug render info
  console.log('🎨 Rendering RecordsScreen with:', {
    isLoading,
    error,
    expensesCount: expenses.length,
    filteredCount: filteredExpenses.length,
    totalAmount,
    categoryTotalsCount: categoryTotals.length,
    tagTotalsCount: tagTotals.length
  });

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const category = categories.find((c: Category) => c.name === item.category);

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
        </View>
        
        <View style={styles.expenseDetails}>
          {category && (
            <View style={styles.expenseCategory}>
              <View
                style={[
                  styles.expenseCategoryIcon,
                  { backgroundColor: category.color + '20' },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={category.color}
                />
              </View>
              <Text style={styles.expenseCategoryText}>{item.category}</Text>
            </View>
          )}
          <Text style={styles.expenseTag}>• {item.tag}</Text>
          
          <Text style={styles.expenseDate}>• {formatDate(new Date(item.expenseDate))}</Text>
        </View>
        
        {item.remarks && (
          <Text style={styles.expenseRemarks}>"{item.remarks}"</Text>
        )}
      </View>
    );
  };

  const renderDateFilterOption = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedDateFilter === item.id && styles.selectedFilterOption,
      ]}
      onPress={() => setSelectedDateFilter(item.id)}
    >
      <Text
        style={[
          styles.filterOptionText,
          selectedDateFilter === item.id && styles.selectedFilterOptionText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryTotal = ({ item }: { item: any }) => (
    <View style={styles.totalItem}>
      <View style={styles.totalItemLeft}>
        <View style={[styles.totalItemIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={20} color={item.color} />
        </View>
        <View style={styles.totalItemInfo}>
          <Text style={styles.totalItemLabel}>{item.category}</Text>
          <Text style={[styles.totalItemCount]}>{item.count} transactions</Text>
        </View>
        <Text style={[styles.totalItemAmount, {fontWeight: 'bold'}]}>{formatCurrency(item.total)}</Text>
      </View>
    </View>
  );

  const renderTagTotal = ({ item }: { item: any }) => (
    <View style={styles.totalItem}>
      <View style={styles.totalItemLeft}>
        <View style={styles.totalItemInfo}>
          <Text style={styles.totalItemLabel}>{item.tag}</Text>
          <Text style={styles.totalItemCount}>{item.count} transactions</Text>
        </View>
        <Text style={styles.totalItemAmount}>{formatCurrency(item.total)}</Text>
      </View>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExpenses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expense Records</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-expense')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Date Filter Options */}
        <View style={styles.filterContainer}>
          {/* <Text style={styles.filterSectionTitle}>Date Range</Text> */}
          <FlatList
            data={dateFilterOptions}
            renderItem={renderDateFilterOption}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Category and Tag Filters */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterSectionTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory && styles.selectedFilterButton]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="pricetag" size={16} color={selectedCategory ? 'white' : '#666'} />
              <Text style={[styles.filterButtonText, selectedCategory && styles.selectedFilterButtonText]}>
                {selectedCategory || 'Category'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, selectedTag && styles.selectedFilterButton, !selectedCategory && styles.disabledButton]}
              onPress={() => selectedCategory && setShowTagModal(true)}
              disabled={!selectedCategory}
            >
              <Ionicons name="pricetag-outline" size={16} color={selectedTag ? 'white' : '#666'} />
              <Text style={[styles.filterButtonText, selectedTag && styles.selectedFilterButtonText]}>
                {selectedTag || 'Tag'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              {dateFilterOptions.find(f => f.id === selectedDateFilter)?.label}
            </Text>
            <Text style={styles.summaryCount}>{filteredExpenses.length} transactions</Text>
          </View>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.totalLabel}>Total Expenses</Text>
        </View>

        {/* Category Totals */}
        {categoryTotals.length > 0 && (
          <View style={styles.totalsContainer}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <FlatList
              data={categoryTotals}
              renderItem={renderCategoryTotal}
              keyExtractor={(item) => item.category}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Tag Totals */}
        {tagTotals.length > 0 && selectedCategory && (
          <View style={styles.totalsContainer}>
            <Text style={styles.sectionTitle}>By Tag</Text>
            <FlatList
              data={tagTotals}
              renderItem={renderTagTotal}
              keyExtractor={(item) => item.tag}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Expenses List */}
        <View style={styles.expensesContainer}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {filteredExpenses.length > 0 ? (
            <FlatList
              data={filteredExpenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.expensesList}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No expenses found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleCategorySelect('')}
              >
                <Text style={styles.modalItemText}>All Categories</Text>
                {!selectedCategory && (
                  <Ionicons name="checkmark" size={20} color="#4264ED" />
                )}
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={styles.modalItem}
                  onPress={() => handleCategorySelect(category.name)}
                >
                  <View style={styles.modalItemContent}>
                    <View
                      style={[
                        styles.modalItemIcon,
                        { backgroundColor: category.color + '20' },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={category.color}
                      />
                    </View>
                    <Text style={styles.modalItemText}>{category.name}</Text>
                  </View>
                  {selectedCategory === category.name && (
                    <Ionicons name="checkmark" size={20} color="#4264ED" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Tag Modal */}
      <Modal
        visible={showTagModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tag</Text>
              <TouchableOpacity onPress={() => setShowTagModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleTagSelect('')}
              >
                <Text style={styles.modalItemText}>All Tags</Text>
                {!selectedTag && (
                  <Ionicons name="checkmark" size={20} color="#4264ED" />
                )}
              </TouchableOpacity>
              {getAvailableTags().map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.modalItem}
                  onPress={() => handleTagSelect(tag)}
                >
                  <Text style={styles.modalItemText}>{tag}</Text>
                  {selectedTag === tag && (
                    <Ionicons name="checkmark" size={20} color="#4264ED" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4264ED',
    padding: 10,
    borderRadius: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterList: {
    paddingRight: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFilterOption: {
    backgroundColor: '#4264ED',
    borderColor: '#4264ED',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFilterButton: {
    backgroundColor: '#4264ED',
    borderColor: '#4264ED',
  },
  disabledButton: {
    opacity: 0.5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  selectedFilterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryCount: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  totalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalItemInfo: {
    flex: 1,
  },
  totalItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  totalItemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  totalItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  expensesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  expensesList: {
    paddingBottom: 20,
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  expenseCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseCategoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseCategoryText: {
    fontSize: 14,
    color: '#666',
  },
  expenseTag: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseRemarks: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalBody: {
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    padding: 16,
    backgroundColor: '#4264ED',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});