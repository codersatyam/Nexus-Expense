import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchExpenses, Expense } from '../../api/expenseApi';
import { categories, Category } from '../../constants/categories';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function HomeScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch expenses from API
  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userDataStr = await AsyncStorage.getItem('email_verification_status');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      console.log('🔍 HomeScreen: Fetching expenses for userId:', userData?.userId);
      const data = await fetchExpenses(userData?.userId);
      console.log('📊 HomeScreen: Loaded expenses:', data.length);
      setExpenses(data);
    } catch (err) {
      console.error('❌ HomeScreen: Failed to load expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  // Load expenses on component mount
  useEffect(() => {
    console.log('🚀 HomeScreen: Component mounted, loading expenses...');
    loadExpenses();
  }, []);

  // Refresh expenses when screen comes into focus (e.g., after adding new expense)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 HomeScreen: Screen focused, refreshing expenses...');
      loadExpenses();
    }, [])
  );

  // Get recent expenses (latest 5)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
    .slice(0, 4);

  // Calculate current month total
  const currentMonthTotal = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Helper function to get current month expenses
  const getCurrentMonthExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });
  };

  const currentMonthExpenses = getCurrentMonthExpenses();
  const currentMonthTransactionCount = currentMonthExpenses.length;
  const currentMonthAverage = currentMonthTransactionCount > 0 
    ? Math.round(currentMonthTotal / currentMonthTransactionCount) 
    : 0;

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c: Category) => c.name === category);
    return cat?.color || '#F7DC6F';
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c: Category) => c.name === category);
    return cat?.icon || 'ellipsis-horizontal';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const category = categories.find((c: Category) => c.name === item.category);
    
    return (
      <View style={styles.expenseItem}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={getCategoryColor(item.category)} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.dateText}>{formatDate(new Date(item.expenseDate))}</Text>
        </View>
      </View>
    );
  };

  // Splash Screen
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          {/* App Icon */}
          <View style={styles.splashIconContainer}>
            <Ionicons name="wallet" size={80} color="#007AFF" />
          </View>

          {/* App Name */}
          <Text style={styles.splashAppName}>Expenses Tracker</Text>
          
          {/* Subtitle */}
          <Text style={styles.splashSubtitle}>Smart Finance Management</Text>

          {/* Loading Message */}
          <View style={styles.splashLoadingContainer}>
            <Text style={styles.splashLoadingText}>Loading...</Text>
            <View style={styles.splashLoadingDots}>
              <View style={styles.splashDot} />
              <View style={styles.splashDot} />
              <View style={styles.splashDot} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExpenses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Add Button */}
      {/* <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Expense Tracker</Text>
          <Text style={styles.headerSubtitle}>Manage your finances</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-expense')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View> */}

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.cardHeader}>
          <View>
            {/* <Text style={styles.welcomeText}>Welcome to</Text> */}
            <Text style={styles.nameText}>Nexus</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardSubtext}>
            Maintain All your Expenses here.
          </Text>
        </View>
      </View>

      {/* Current Month Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryTitle}>Current Month</Text>
            <Text style={styles.summaryPeriod}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.transactionInfo}>
              <Ionicons name="receipt-outline" size={16} color="#34C759" />
              <Text style={styles.transactionText}>
                {currentMonthTransactionCount} transactions
              </Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <Text style={[styles.totalAmount, {color: '#34C759'}]}>{formatCurrency(currentMonthTotal)}</Text>
            <Text style={styles.totalLabel}>Total Spent</Text>
          </View>
        </View>
        
        {/* Progress Bar
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((currentMonthTotal / 50000) * 100, 100)}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((currentMonthTotal / 50000) * 100)}% of monthly budget
          </Text>
        </View> */}
      </View>

      {/* Recent Expenses */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => router.push('/records')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={recentExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Add Expense Button at Bottom */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.addExpenseButton}
          onPress={() => router.push('/add-expense')}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.addExpenseButtonText}>Add New Expense</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#4264ED',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4264ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeCard: {
    backgroundColor: '#4264ED',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4264ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  nameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  cardContent: {
    marginTop: 20,
  },
  cardSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginBottom: 16,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  calculateButtonText: {
    color: '#4264ED',
    fontSize: 14,
    fontWeight: '600',
  },
  loansContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  loanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  loanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  loanInfo: {
    flex: 1,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  loanDescription: {
    fontSize: 12,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#5d6d7e',
    margin: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4264ED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLeft: {
    flex: 1,
  },
  summaryTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryPeriod: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  transactionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 24,
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    height: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#4264ED',
    fontSize: 14,
    fontWeight: '500',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 8,
  },
  bottomSection: {
    padding: 16,
    paddingBottom: 32,
  },
  addExpenseButton: {
    backgroundColor: '#4264ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#4264ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addExpenseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4264ED',
    padding: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIconContainer: {
    backgroundColor: '#4264ED',
    borderRadius: 40,
    padding: 16,
  },
  splashAppName: {
    color: '#4264ED',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
  },
  splashSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  splashLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  splashLoadingText: {
    color: '#4264ED',
    fontSize: 18,
    fontWeight: '600',
  },
  splashLoadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  splashDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4264ED',
    marginHorizontal: 2,
  },
});
