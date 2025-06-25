import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchInvestments, Investment } from '../api/investmentApi';
import { investmentCategories } from '../constants/investmentCategories';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function InvestmentsScreen() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Load investments
  const loadInvestments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userDataStr = await AsyncStorage.getItem('email_verification_status');
      console.log('User data from storage:', userDataStr);
      
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      console.log('Parsed user data:', userData);
      
      if (!userData?.userId) {
        console.error('No user ID found in storage');
        setError('User ID not found. Please log in again.');
        return;
      }

      console.log('Loading investments for user:', userData.userId);
      const data = await fetchInvestments(userData.userId);
      console.log('Received investments data:', JSON.stringify(data, null, 2));
      
      if (!data || data.length === 0) {
        console.log('No investments found');
      } else {
        console.log('Found', data.length, 'investments');
        console.log('First investment:', JSON.stringify(data[0], null, 2));
      }
      
      setInvestments(data || []);
    } catch (err) {
      console.error('Error loading investments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load investments');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log('Initial load of investments');
    loadInvestments();
  }, []);

  // Reload on screen focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, reloading investments');
      loadInvestments();
    }, [])
  );

  // Filter investments
  useEffect(() => {
    console.log('Filtering investments:', {
      total: investments.length,
      year: selectedYear,
      month: selectedMonth,
      category: selectedCategory
    });
    
    let filtered = [...investments];

    // Apply year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(investment => {
        try {
          return new Date(investment.investmentDate).getFullYear().toString() === selectedYear;
        } catch (err) {
          console.error('Error filtering by year:', err);
          return false;
        }
      });
      console.log('After year filter:', filtered.length);
    }

    // Apply month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(investment => {
        try {
          return new Date(investment.investmentDate).getMonth().toString() === selectedMonth;
        } catch (err) {
          console.error('Error filtering by month:', err);
          return false;
        }
      });
      console.log('After month filter:', filtered.length);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(investment => {
        const selectedCat = investmentCategories.find(cat => cat.id === selectedCategory);
        // Try to match by ID, name, or normalized strings
        return (
          investment.category === selectedCategory ||
          investment.category === selectedCat?.name ||
          investment.category.toLowerCase() === selectedCat?.name.toLowerCase() ||
          investment.category.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedCat?.id.toLowerCase()
        );
      });
      console.log('After category filter:', filtered.length);
    }

    console.log('Final filtered investments:', filtered.map(inv => ({
      id: inv.id,
      title: inv.title,
      category: inv.category,
      date: inv.investmentDate
    })));
    setFilteredInvestments(filtered);
  }, [investments, selectedYear, selectedMonth, selectedCategory]);

  // Calculate totals
  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  const renderInvestmentItem = ({ item }: { item: Investment }) => {
    const category = investmentCategories.find(cat => cat.id === item.category);

    return (
      <View style={styles.investmentItem}>
        <View style={styles.investmentHeader}>
          <View style={styles.investmentTitleContainer}>
            {category && (
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={20} color={category.color} />
              </View>
            )}
            <View>
              <Text style={styles.investmentName}>{item.title}</Text>
              <Text style={styles.categoryName}>{category?.name || item.category}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => {/* TODO: Add edit functionality */}}>
            <Ionicons name="create-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.investmentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invested Amount</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.amount)}</Text>
          </View>
          {item.tag && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tag</Text>
              <Text style={styles.detailValue}>{item.tag}</Text>
            </View>
          )}
        </View>

        <View style={styles.investmentFooter}>
          <Text style={styles.dateText}>
            Invested on {formatDate(new Date(item.investmentDate))}
          </Text>
          {item.remarks && (
            <Text style={styles.updateText}>
              {item.remarks}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4264ED" />
          <Text style={styles.loadingText}>Loading investments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInvestments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Portfolio</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-investment')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}></Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedYear !== 'all' && styles.filterButtonActive
              ]}
              onPress={() => setShowYearModal(true)}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={selectedYear !== 'all' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.filterButtonText,
                selectedYear !== 'all' && styles.filterButtonTextActive
              ]}>
                {selectedYear === 'all' ? 'All Years' : selectedYear}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={selectedYear !== 'all' ? '#fff' : '#666'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedMonth !== 'all' && styles.filterButtonActive
              ]}
              onPress={() => setShowMonthModal(true)}
            >
              <Ionicons 
                name="calendar-outline" 
                size={20} 
                color={selectedMonth !== 'all' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.filterButtonText,
                selectedMonth !== 'all' && styles.filterButtonTextActive
              ]}>
                {selectedMonth === 'all' 
                  ? 'All Months' 
                  : new Date(2000, parseInt(selectedMonth)).toLocaleString('default', { month: 'long' })
                }
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={selectedMonth !== 'all' ? '#fff' : '#666'} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory && styles.filterButtonActive
              ]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons 
                name="pricetag-outline" 
                size={20} 
                color={selectedCategory ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.filterButtonText,
                selectedCategory && styles.filterButtonTextActive
              ]}>
                {selectedCategory 
                  ? investmentCategories.find(cat => cat.id === selectedCategory)?.name 
                  : 'All Categories'
                }
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={selectedCategory ? '#fff' : '#666'} 
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Main Portfolio Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Portfolio Value</Text>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryCount}>{filteredInvestments.length} investments</Text>
              </View>
            </View>

            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryAmount}>{formatCurrency(totalInvested)}</Text>
                <View style={styles.summaryChange}>
                  <Text style={styles.summaryChangeLabel}>Total Invested</Text>
                </View>
              </View>
            </View>

            {/* Category Distribution */}
            <View style={styles.categoryDistribution}>
              <Text style={styles.distributionTitle}>Portfolio Breakdown</Text>
              {investmentCategories.map(cat => {
                const categoryInvestments = filteredInvestments.filter(inv => 
                  inv.category === cat.id || 
                  inv.category === cat.name ||
                  inv.category.toLowerCase() === cat.name.toLowerCase()
                );
                const categoryTotal = categoryInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                const percentage = totalInvested > 0 ? (categoryTotal / totalInvested) * 100 : 0;
                
                if (categoryTotal > 0) {
                  return (
                    <View key={cat.id} style={styles.distributionItem}>
                      <View style={styles.distributionHeader}>
                        <View style={styles.distributionLabel}>
                          <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                            <Ionicons name={cat.icon} size={16} color={cat.color} />
                          </View>
                          <View style={styles.distributionInfo}>
                            <Text style={styles.distributionText}>{cat.name}</Text>
                            <Text style={styles.distributionAmount}>{formatCurrency(categoryTotal)}</Text>
                          </View>
                        </View>
                        <Text style={styles.distributionPercentage}>{percentage.toFixed(1)}%</Text>
                      </View>
                      <View style={styles.distributionBarContainer}>
                        <View 
                          style={[
                            styles.distributionBarFill, 
                            { 
                              backgroundColor: cat.color,
                              width: `${percentage}%` 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          </View>
        </View>

        {/* Investments List */}
        <View style={styles.investmentsContainer}>
          <Text style={styles.sectionTitle}>Your Investments</Text>
          {filteredInvestments.length > 0 ? (
            <FlatList
              data={filteredInvestments}
              renderItem={renderInvestmentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.investmentsList}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="bar-chart-outline" size={48} color="#4264ED" />
              </View>
              <Text style={styles.emptyText}>No investments found</Text>
              <Text style={styles.emptySubtext}>Start by adding your first investment</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => router.push('/add-investment')}
              >
                <Text style={styles.addFirstButtonText}>Add Investment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Year Modal */}
      <Modal
        visible={showYearModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedYear('all');
                  setShowYearModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Years</Text>
                {selectedYear === 'all' && (
                  <Ionicons name="checkmark" size={20} color="#4264ED" />
                )}
              </TouchableOpacity>
              {Array.from({ length: 5 }, (_, i) => {
                const year = (new Date().getFullYear() - i).toString();
                return (
                  <TouchableOpacity
                    key={year}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{year}</Text>
                    {selectedYear === year && (
                      <Ionicons name="checkmark" size={20} color="#4264ED" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Month Modal */}
      <Modal
        visible={showMonthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedMonth('all');
                  setShowMonthModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Months</Text>
                {selectedMonth === 'all' && (
                  <Ionicons name="checkmark" size={20} color="#4264ED" />
                )}
              </TouchableOpacity>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i.toString();
                const monthName = new Date(2000, i).toLocaleString('default', { month: 'long' });
                return (
                  <TouchableOpacity
                    key={month}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedMonth(month);
                      setShowMonthModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{monthName}</Text>
                    {selectedMonth === month && (
                      <Ionicons name="checkmark" size={20} color="#4264ED" />
                    )}
                  </TouchableOpacity>
                );
              })}
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
                onPress={() => {
                  setSelectedCategory('');
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Categories</Text>
                {!selectedCategory && (
                  <Ionicons name="checkmark" size={20} color="#4264ED" />
                )}
              </TouchableOpacity>
              {investmentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <Text style={styles.modalItemText}>{cat.name}</Text>
                  </View>
                  {selectedCategory === cat.id && (
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#4264ED',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4264ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  summaryContainer: {
    padding: 20,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryBadge: {
    backgroundColor: '#4264ED20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryCount: {
    fontSize: 14,
    color: '#4264ED',
    fontWeight: '500',
  },
  summaryDetails: {
    marginBottom: 24,
  },
  summaryRow: {
    alignItems: 'flex-start',
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  summaryChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryChangeLabel: {
    fontSize: 14,
    color: '#666',
  },
  categoryDistribution: {
    gap: 20,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  distributionItem: {
    gap: 8,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distributionInfo: {
    gap: 2,
  },
  distributionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  distributionAmount: {
    fontSize: 12,
    color: '#666',
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  distributionBarContainer: {
    height: 6,
    backgroundColor: '#f5f6fa',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filterRow: {
    paddingRight: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#4264ED',
    borderColor: '#4264ED',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  investmentsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  investmentsList: {
    gap: 12,
  },
  investmentItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  investmentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  investmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
  },
  investmentDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  investmentFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  updateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4264ED20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#4264ED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4264ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  },
  modalItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4264ED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});