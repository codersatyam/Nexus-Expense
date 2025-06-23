import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchExpenses, Expense } from '../../api/expenseApi';
import { categories, Category } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showTimeFrameModal, setShowTimeFrameModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Time frame options
  const timeFrameOptions = [
    { id: 'thisWeek', label: 'This Week', days: 7 },
    { id: 'thisMonth', label: 'This Month', days: 30 },
    { id: 'lastMonth', label: 'Last Month', days: 30 },
    { id: 'last3Months', label: 'Last 3 Months', days: 90 },
    { id: 'last6Months', label: 'Last 6 Months', days: 180 },
    { id: 'thisYear', label: 'This Year', days: 365 },
    { id: 'allTime', label: 'All Time', days: 365 * 10 },
  ];

  // Fetch expenses from API
  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userDataStr = await AsyncStorage.getItem('email_verification_status');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      const data = await fetchExpenses(userData?.userId);
      console.log('📊 StatsScreen: Loaded expenses:', data.length);
      setExpenses(data);
    } catch (err) {
      console.error('❌ StatsScreen: Failed to load expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load expenses on component mount
  useEffect(() => {
    console.log('🚀 StatsScreen: Component mounted, loading expenses...');
    loadExpenses();
  }, []);

  // Filter expenses based on selected filters
  useEffect(() => {
    let filtered = [...expenses];

    // Apply time frame filter
    const now = new Date();
    
    switch (selectedTimeFrame) {
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= weekStart;
        });
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= monthStart;
        });
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd;
        });
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= threeMonthsAgo;
        });
        break;
      case 'last6Months':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= sixMonthsAgo;
        });
        break;
      case 'thisYear':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expenseDate);
          return expenseDate >= yearStart;
        });
        break;
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    console.log('🔍 Filtered expenses:', filtered.length, 'for timeframe:', selectedTimeFrame);
    setFilteredExpenses(filtered);
  }, [expenses, selectedTimeFrame, selectedCategory]);

  // Calculate statistics
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

  // Category breakdown
  const categoryBreakdown = categories
    .map((category: Category) => {
      const categoryExpenses = filteredExpenses.filter(expense => expense.category === category.name);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentage = totalAmount > 0 ? (total / totalAmount) * 100 : 0;
      return {
        category: category.name,
        total,
        count: categoryExpenses.length,
        percentage,
        color: category.color,
        icon: category.icon,
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.total - a.total);

  // Handler functions
  const handleTimeFrameSelect = (timeFrame: string) => {
    setSelectedTimeFrame(timeFrame);
    setShowTimeFrameModal(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading statistics...</Text>
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
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSubtitle}>Analyze your spending patterns</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, selectedTimeFrame && styles.selectedFilterButton]}
              onPress={() => setShowTimeFrameModal(true)}
            >
              <Ionicons name="calendar" size={16} color={selectedTimeFrame ? 'white' : '#666'} />
              <Text style={[styles.filterButtonText, selectedTimeFrame && styles.selectedFilterButtonText]}>
                {timeFrameOptions.find(tf => tf.id === selectedTimeFrame)?.label || 'Time Frame'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory && styles.selectedFilterButton]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="pricetag" size={16} color={selectedCategory ? 'white' : '#666'} />
              <Text style={[styles.filterButtonText, selectedCategory && styles.selectedFilterButtonText]}>
                {selectedCategory || 'All Categories'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="wallet-outline" size={24} color="#4264ED" />
              <Text style={styles.summaryCardTitle}>Total Spent</Text>
              <Text style={styles.summaryCardAmount}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="trending-up-outline" size={24} color="#34C759" />
              <Text style={styles.summaryCardTitle}>Average</Text>
              <Text style={styles.summaryCardAmount}>{formatCurrency(Math.round(averageAmount))}</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="receipt-outline" size={24} color="#FF9500" />
              <Text style={styles.summaryCardTitle}>Transactions</Text>
              <Text style={styles.summaryCardAmount}>{filteredExpenses.length}</Text>
            </View>
          </View>
        </View>

        {/* Additional Statistics */}
        <View style={styles.additionalStatsContainer}>
          <View style={styles.additionalStatsCard}>
            <View style={styles.additionalStatsHeader}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.additionalStatsTitle}>Spending Insights</Text>
            </View>
            <View style={styles.additionalStatsContent}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Highest Spending Day</Text>
                <Text style={styles.insightValue}>
                  {(() => {
                    const dayTotals = filteredExpenses.reduce((acc, expense) => {
                      const day = new Date(expense.expenseDate).toLocaleDateString('en-US', { weekday: 'long' });
                      acc[day] = (acc[day] || 0) + expense.amount;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const maxDay = Object.entries(dayTotals).reduce((max, [day, amount]) => 
                      amount > max.amount ? { day, amount } : max, { day: 'N/A', amount: 0 }
                    );
                    
                    return maxDay.day;
                  })()}
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Most Used Category</Text>
                <Text style={styles.insightValue}>
                  {categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A'}
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Average Daily Spend</Text>
                <Text style={styles.insightValue}>
                  {formatCurrency(Math.round(totalAmount / Math.max(filteredExpenses.length, 1)))}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Category Breakdown</Text>
          
          {/* Pie Chart Visualization */}
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChart}>
              {categoryBreakdown.map((item, index) => {
                const percentage = item.percentage;
                const rotation = categoryBreakdown
                  .slice(0, index)
                  .reduce((sum, prevItem) => sum + prevItem.percentage, 0);
                
                return (
                  <View
                    key={index}
                    style={[
                      styles.pieSlice,
                      {
                        backgroundColor: item.color,
                        transform: [
                          { rotate: `${rotation * 3.6}deg` },
                        ],
                        width: percentage > 50 ? '100%' : '50%',
                        height: percentage > 50 ? '100%' : '50%',
                        borderRadius: percentage > 50 ? 100 : 0,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.pieChartCenter}>
              <Text style={styles.pieChartTotal}>{formatCurrency(totalAmount)}</Text>
              <Text style={styles.pieChartLabel}>Total</Text>
            </View>
          </View>
          
          {/* Category List */}
          <View style={styles.categoryList}>
            {categoryBreakdown.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryItemLeft}>
                  <View style={[styles.categoryItemIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.categoryItemInfo}>
                    <Text style={styles.categoryItemName}>{item.category}</Text>
                    <Text style={styles.categoryItemCount}>{item.count} transactions</Text>
                  </View>
                </View>
                <View style={styles.categoryItemRight}>
                  <Text style={styles.categoryItemAmount}>{formatCurrency(item.total)}</Text>
                  <Text style={styles.categoryItemPercentage}>{item.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Time Frame Modal */}
      <Modal
        visible={showTimeFrameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeFrameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Frame</Text>
              <TouchableOpacity onPress={() => setShowTimeFrameModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {timeFrameOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.modalItem}
                  onPress={() => handleTimeFrameSelect(option.id)}
                >
                  <Text style={styles.modalItemText}>{option.label}</Text>
                  {selectedTimeFrame === option.id && (
                    <Ionicons name="checkmark" size={20} color="#4264ED" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  selectedFilterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryCardContent: {
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryCardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  additionalStatsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  additionalStatsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  additionalStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  additionalStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  additionalStatsContent: {
    marginTop: 16,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoryContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  pieChartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  pieChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '50%',
    transformOrigin: '100% 100%',
  },
  pieChartCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pieChartTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  pieChartLabel: {
    fontSize: 12,
    color: '#666',
  },
  categoryList: {
    marginTop: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryItemInfo: {
    flex: 1,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  categoryItemCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryItemRight: {
    alignItems: 'flex-end',
  },
  categoryItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  categoryItemPercentage: {
    fontSize: 12,
    color: '#4264ED',
    fontWeight: '500',
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
    flex: 1,
  },
  modalItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
}); 