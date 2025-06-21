import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLendById, LendStatus, Lend } from '../../services/lendService';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';

const LendDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lend, setLend] = useState<Lend | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    remark: '',
    totalAmount: '',
    partial: '',
    due: '',
    dateOfPayment: new Date(),
    status: LendStatus.ACTIVE,
  });

  useEffect(() => {
    if (id) {
      loadLendDetails();
    }
  }, [id]);

  const loadLendDetails = async () => {
    try {
      setLoading(true);
      // Using hardcoded phone number for now - replace with actual user phone when needed
      const phoneNumber = '9548313517';
      const lendData = await getLendById(id, phoneNumber);
      if (lendData) {
        setLend(lendData);
        setFormData({
          name: lendData.name,
          title: lendData.title,
          remark: lendData.remark,
          totalAmount: lendData.totalAmount.toString(),
          partial: lendData.partial.toString(),
          due: lendData.due.toString(),
          dateOfPayment: lendData.dateOfPayment,
          status: lendData.status,
        });
      } else {
        Alert.alert('Error', 'Lend not found');
        router.push('/(tabs)/lend');
      }
    } catch (error) {
      console.error('Error loading lend details:', error);
      Alert.alert('Error', 'Failed to load lend details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLend = async () => {
    Alert.alert('Coming Soon', 'Update functionality will be available when the update API is ready.');
  };

  const handleStatusChange = async (newStatus: LendStatus) => {
    Alert.alert('Coming Soon', 'Status update functionality will be available when the update API is ready.');
  };

  const getStatusText = (status: LendStatus) => {
    switch (status) {
      case LendStatus.ACTIVE:
        return 'Active';
      case LendStatus.PAID:
        return 'Paid';
      case LendStatus.PARTIAL:
        return 'Partial';
      case LendStatus.CLOSED:
        return 'Closed';
      default:
        return 'Active';
    }
  };

  const getStatusColor = (status: LendStatus) => {
    switch (status) {
      case LendStatus.ACTIVE:
        return '#FF9500';
      case LendStatus.PAID:
        return '#34C759';
      case LendStatus.PARTIAL:
        return '#007AFF';
      case LendStatus.CLOSED:
        return '#8E8E93';
      default:
        return '#FF9500';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading lend details...</Text>
      </View>
    );
  }

  if (!lend) {
    return (
      <View style={styles.errorContainer}>
        <Text>Lend not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/lend')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lend Details</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)} style={[styles.editButton, styles.disabledButton]}>
          <Ionicons name="create-outline" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Lend Card */}
        <View style={styles.lendCard}>
          <View style={styles.lendHeader}>
            <View style={styles.lendInfo}>
              <Text style={styles.name}>{lend.name}</Text>
              <Text style={styles.title}>{lend.title}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lend.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(lend.status) }]}>
                {getStatusText(lend.status)}
              </Text>
            </View>
          </View>

          <View style={styles.lendDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{formatDate(lend.dateOfPayment)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailValue}>{formatCurrency(lend.totalAmount)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Partial Amount:</Text>
              <Text style={styles.detailValue}>{formatCurrency(lend.partial)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Amount:</Text>
              <Text style={[styles.detailValue, { color: lend.due > 0 ? '#FF3B30' : '#34C759' }]}>
                {formatCurrency(lend.due)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>{formatDate(lend.createdAt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated:</Text>
              <Text style={styles.detailValue}>{formatDate(lend.updatedAt)}</Text>
            </View>
          </View>

          {lend.remark && (
            <View style={styles.remarkContainer}>
              <Text style={styles.remarkLabel}>Remarks:</Text>
              <Text style={styles.remark}>{lend.remark}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.comingSoonNote}>
            <Ionicons name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.comingSoonText}>Update functionality coming soon when API is ready</Text>
          </View>
          <TouchableOpacity 
            style={[styles.actionButton, styles.disabledButton]}
            onPress={() => setShowStatusModal(true)}
            disabled={true}
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ccc" />
            <Text style={[styles.actionButtonText, styles.disabledText]}>Change Status (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Lend</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.comingSoonContainer}>
            <Ionicons name="construct-outline" size={64} color="#ccc" />
            <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
            <Text style={styles.comingSoonDescription}>
              The edit functionality will be available once the update API is ready.
            </Text>
            <Text style={styles.comingSoonSubtext}>
              For now, you can view all lend details and filter by status.
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.okButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Change Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.comingSoonStatusContainer}>
              <Ionicons name="construct-outline" size={48} color="#ccc" />
              <Text style={styles.comingSoonStatusTitle}>Coming Soon!</Text>
              <Text style={styles.comingSoonStatusText}>
                Status update functionality will be available when the update API is ready.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.okStatusButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.okStatusButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  lendInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lendDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  remarkContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  remarkLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  remark: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
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
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  okButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
  comingSoonStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonStatusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  comingSoonStatusText: {
    fontSize: 16,
    color: '#666',
  },
  okStatusButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  okStatusButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#ccc',
  },
  comingSoonNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});

export default LendDetailsScreen; 