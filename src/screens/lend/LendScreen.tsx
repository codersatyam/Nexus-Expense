import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { 
  getAllLends, 
  addLend, 
  getLendStats, 
  searchLendsByNameStatusAndTime,
  LendStatus,
  TimeFrame,
  Lend 
} from '../../services/lendService';
import { 
  formatCurrency, 
  formatDate, 
  formatStatus,
  formatPercentage 
} from '../../utils/formatters';

const LendScreen = () => {
  const router = useRouter();
  const [lends, setLends] = useState<Lend[]>([]);
  const [filteredLends, setFilteredLends] = useState<Lend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LendStatus | 'all'>('all');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>(TimeFrame.ALL_TIME);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    remark: '',
    totalAmount: '',
    partial: '',
    due: '',
    dateOfPayment: new Date(),
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadLends();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm, selectedStatus, selectedTimeFrame);
  }, [searchTerm, selectedStatus, selectedTimeFrame, lends]);

  const loadLends = async () => {
    try {
      setLoading(true);
      // Using hardcoded phone number for now - replace with actual user phone when needed
      const phoneNumber = '9548313517';
      console.log('🔍 Fetching lends for phone:', phoneNumber);
      const lendsData = await getAllLends(phoneNumber);
      console.log('📊 Raw API response data:', JSON.stringify(lendsData, null, 2));
      console.log('📈 Number of lends received:', lendsData.length);
      setLends(lendsData);
      setFilteredLends(lendsData);
      setStats(getLendStats(lendsData));
      console.log('✅ Lends set in state:', lendsData.length);
    } catch (error) {
      console.error('❌ Failed to load lends:', error);
      Alert.alert('Error', 'Failed to load lends');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string, status: LendStatus | 'all', timeFrame: TimeFrame) => {
    setSearchTerm(term);
    setSelectedStatus(status);
    setSelectedTimeFrame(timeFrame);
    
    try {
      // Using hardcoded phone number for now - replace with actual user phone when needed
      const phoneNumber = '9548313517';
      const searchResults = await searchLendsByNameStatusAndTime(term, status, timeFrame, phoneNumber);
      setFilteredLends(searchResults);
      setStats(getLendStats(searchResults));
    } catch (error) {
      console.error('Search error:', error);
      setFilteredLends(lends);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLends();
    setRefreshing(false);
  };

  const handleAddLend = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter name');
      return;
    }
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter title');
      return;
    }
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid total amount');
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const partial = parseFloat(formData.partial) || 0;
    const due = totalAmount - partial;

    if (partial > totalAmount) {
      Alert.alert('Error', 'Partial amount cannot be greater than total amount');
      return;
    }

    try {
      // Using hardcoded phone number for now - replace with actual user phone when needed
      const phoneNumber = '9548313517';
      console.log('🔍 Adding lend for phone:', phoneNumber);
      
      const newLend = await addLend({
        ...formData,
        totalAmount,
        partial,
        due,
        status: due === 0 ? LendStatus.PAID : partial > 0 ? LendStatus.PARTIAL : LendStatus.ACTIVE,
      }, phoneNumber);

      console.log('✅ Lend added successfully:', newLend);
      setLends(prev => [...prev, newLend]);
      setStats(getLendStats([...lends, newLend]));
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Lend added successfully');
    } catch (error) {
      console.error('❌ Failed to add lend:', error);
      Alert.alert('Error', 'Failed to add lend');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      remark: '',
      totalAmount: '',
      partial: '',
      due: '',
      dateOfPayment: new Date(),
    });
  };

  const handleLendPress = (lend: Lend) => {
    router.push(`/lend-details?id=${lend.id}`);
  };

  const getStatusText = (status: LendStatus | 'all') => {
    switch (status) {
      case 'all':
        return 'All Status';
      case LendStatus.ACTIVE:
        return 'Active';
      case LendStatus.PAID:
        return 'Paid';
      case LendStatus.PARTIAL:
        return 'Partial';
      case LendStatus.CLOSED:
        return 'Closed';
      default:
        return 'All Status';
    }
  };

  const getTimeFrameText = (timeFrame: TimeFrame) => {
    switch (timeFrame) {
      case TimeFrame.TODAY:
        return 'Today';
      case TimeFrame.THIS_WEEK:
        return 'This Week';
      case TimeFrame.THIS_MONTH:
        return 'This Month';
      case TimeFrame.THIS_YEAR:
        return 'This Year';
      case TimeFrame.ALL_TIME:
        return 'All Time';
      default:
        return 'All Time';
    }
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchAndFiltersContainer}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchTerm}
          onChangeText={(text) => handleSearch(text, selectedStatus, selectedTimeFrame)}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('', selectedStatus, selectedTimeFrame)}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Buttons Row */}
      <View style={styles.filterButtonsRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowStatusFilter(true)}
        >
          <Ionicons name="filter" size={16} color="#666" />
          <Text style={styles.filterButtonText}>{getStatusText(selectedStatus)}</Text>
          <Ionicons name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowTimeFilter(true)}
        >
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.filterButtonText}>{getTimeFrameText(selectedTimeFrame)}</Text>
          <Ionicons name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          Summary {getTimeFrameText(selectedTimeFrame)}
          {searchTerm && ` - "${searchTerm}"`}
          {selectedStatus !== 'all' && ` - ${getStatusText(selectedStatus)}`}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(stats.totalLent)}</Text>
            <Text style={styles.statLabel}>Total Lent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(stats.totalDue)}</Text>
            <Text style={styles.statLabel}>Total Due</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeLends}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.partialLends}</Text>
            <Text style={styles.statLabel}>Partial</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.paidLends}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.closedLends}</Text>
            <Text style={styles.statLabel}>Closed</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatusFilterModal = () => (
    <Modal
      visible={showStatusFilter}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter by Status</Text>
            <TouchableOpacity onPress={() => setShowStatusFilter(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedStatus === 'all' && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, 'all', selectedTimeFrame);
              setShowStatusFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedStatus === 'all' && styles.filterOptionTextSelected
            ]}>
              All Status
            </Text>
            {selectedStatus === 'all' && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedStatus === LendStatus.ACTIVE && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, LendStatus.ACTIVE, selectedTimeFrame);
              setShowStatusFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedStatus === LendStatus.ACTIVE && styles.filterOptionTextSelected
            ]}>
              Active
            </Text>
            {selectedStatus === LendStatus.ACTIVE && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedStatus === LendStatus.PARTIAL && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, LendStatus.PARTIAL, selectedTimeFrame);
              setShowStatusFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedStatus === LendStatus.PARTIAL && styles.filterOptionTextSelected
            ]}>
              Partial
            </Text>
            {selectedStatus === LendStatus.PARTIAL && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedStatus === LendStatus.PAID && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, LendStatus.PAID, selectedTimeFrame);
              setShowStatusFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedStatus === LendStatus.PAID && styles.filterOptionTextSelected
            ]}>
              Paid
            </Text>
            {selectedStatus === LendStatus.PAID && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedStatus === LendStatus.CLOSED && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, LendStatus.CLOSED, selectedTimeFrame);
              setShowStatusFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedStatus === LendStatus.CLOSED && styles.filterOptionTextSelected
            ]}>
              Closed
            </Text>
            {selectedStatus === LendStatus.CLOSED && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTimeFilterModal = () => (
    <Modal
      visible={showTimeFilter}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter by Time</Text>
            <TouchableOpacity onPress={() => setShowTimeFilter(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedTimeFrame === TimeFrame.TODAY && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, selectedStatus, TimeFrame.TODAY);
              setShowTimeFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedTimeFrame === TimeFrame.TODAY && styles.filterOptionTextSelected
            ]}>
              Today
            </Text>
            {selectedTimeFrame === TimeFrame.TODAY && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedTimeFrame === TimeFrame.THIS_WEEK && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, selectedStatus, TimeFrame.THIS_WEEK);
              setShowTimeFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedTimeFrame === TimeFrame.THIS_WEEK && styles.filterOptionTextSelected
            ]}>
              This Week
            </Text>
            {selectedTimeFrame === TimeFrame.THIS_WEEK && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedTimeFrame === TimeFrame.THIS_MONTH && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, selectedStatus, TimeFrame.THIS_MONTH);
              setShowTimeFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedTimeFrame === TimeFrame.THIS_MONTH && styles.filterOptionTextSelected
            ]}>
              This Month
            </Text>
            {selectedTimeFrame === TimeFrame.THIS_MONTH && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedTimeFrame === TimeFrame.THIS_YEAR && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, selectedStatus, TimeFrame.THIS_YEAR);
              setShowTimeFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedTimeFrame === TimeFrame.THIS_YEAR && styles.filterOptionTextSelected
            ]}>
              This Year
            </Text>
            {selectedTimeFrame === TimeFrame.THIS_YEAR && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterOption,
              selectedTimeFrame === TimeFrame.ALL_TIME && styles.filterOptionSelected
            ]}
            onPress={() => {
              handleSearch(searchTerm, selectedStatus, TimeFrame.ALL_TIME);
              setShowTimeFilter(false);
            }}
          >
            <Text style={[
              styles.filterOptionText,
              selectedTimeFrame === TimeFrame.ALL_TIME && styles.filterOptionTextSelected
            ]}>
              All Time
            </Text>
            {selectedTimeFrame === TimeFrame.ALL_TIME && (
              <Ionicons name="checkmark" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderLendCard = (lend: Lend) => {
    const status = formatStatus(lend.status);

    return (
      <TouchableOpacity key={lend.id} style={styles.lendCard} onPress={() => handleLendPress(lend)}>
        <View style={styles.lendHeader}>
          <View style={styles.lendInfo}>
            <Text style={styles.name}>{lend.name}</Text>
            <Text style={styles.title}>{lend.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>

        <View style={styles.lendDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(lend.dateOfPayment)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>{formatCurrency(lend.totalAmount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Partial:</Text>
            <Text style={styles.detailValue}>{formatCurrency(lend.partial)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due:</Text>
            <Text style={[styles.detailValue, { color: lend.due > 0 ? '#FF3B30' : '#34C759' }]}>
              {formatCurrency(lend.due)}
            </Text>
          </View>
        </View>

        {lend.remark && (
          <Text style={styles.remark}>{lend.remark}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Lend</Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Total Amount"
            value={formData.totalAmount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, totalAmount: text }))}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Partial Amount (Optional)"
            value={formData.partial}
            onChangeText={(text) => setFormData(prev => ({ ...prev, partial: text }))}
            keyboardType="numeric"
          />

          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateLabel}>Date of Payment: {formatDate(formData.dateOfPayment)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Remark (Optional)"
            value={formData.remark}
            onChangeText={(text) => setFormData(prev => ({ ...prev, remark: text }))}
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowAddModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddLend}
          >
            <Text style={styles.addButtonText}>Add Lend</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfPayment}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setFormData(prev => ({ ...prev, dateOfPayment: date }));
            }
          }}
        />
      )}
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading lends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lend Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderSearchAndFilters()}
        {renderStatsCard()}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lends ({filteredLends.length})
          </Text>
          {filteredLends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchTerm || selectedStatus !== 'all' || selectedTimeFrame !== TimeFrame.ALL_TIME 
                  ? 'No lends found for this filter' 
                  : 'No lends found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchTerm || selectedStatus !== 'all' || selectedTimeFrame !== TimeFrame.ALL_TIME 
                  ? 'Try adjusting your search or filter' 
                  : 'Add your first lend to get started'}
              </Text>
            </View>
          ) : (
            filteredLends.map(renderLendCard)
          )}
        </View>
      </ScrollView>

      {renderAddModal()}
      {renderStatusFilterModal()}
      {renderTimeFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  searchAndFiltersContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statsContainer: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  lendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lendInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lendDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  remark: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default LendScreen; 