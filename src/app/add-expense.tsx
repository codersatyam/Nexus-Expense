import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addExpense, AddExpenseRequest } from '../api/expenseApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categories = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  {name: 'Groceries', icon: 'cart', color: '#FF6B6B'},
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Entertainment', icon: 'film', color: '#45B7D1' },
  { name: 'Utilities', icon: 'flash', color: '#96CEB4' },
  { name: 'Shopping', icon: 'bag', color: '#FFEAA7' },
  { name: 'Health', icon: 'medical', color: '#DDA0DD' },
  { name: 'Education', icon: 'school', color: '#98D8C8' },
  { name: 'Travel', icon: 'airplane', color: '#F7DC6F' },
  { name: 'House', icon: 'home', color: '#F7DC6F' },
  {name: "Trip", icon: 'mountain', color: '#F7DC6F'},
  { name: 'Others', icon: 'ellipsis-horizontal', color: '#F7DC6F' },
];

const categoryTags = {
  Food: ['Swiggy', 'Zomato', "EatClub", "Restaurant", 'Grocery', 'Street Food', 'Others'],
  Groceries: ['Blinkit', 'Zomato', 'InstaMart', 'Others'],
  Transport: ['Ola', 'Uber', 'Metro', 'Bus', 'Train', 'Fuel', 'Others'],
  Entertainment: ['Netflix', 'Amazon Prime', 'Movie Theater', 'Concert', 'Games', 'Others'],
  Utilities: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone Bill', 'Others'],
  Shopping: ['Amazon', 'Flipkart', 'Mall', 'Local Market', 'Online Store', 'Others'],
  Health: ['Pharmacy', 'Doctor', 'Hospital', 'Gym', 'Supplements', 'Tata 1MG', 'Others'],
  Education: ['Books', 'Course', 'Tuition', 'Stationery', 'Online Course', 'Others'],
  Travel: ['Flight', 'Hotel', 'Train', 'Bus', 'Car', 'Metro', 'Others'],
  House: ['Rent', 'Maintenance', 'Repairs', 'Utilities', 'Others'],
  Trip: ['Solo', 'Group', 'Others'],
  Others: ['Miscellaneous', 'Personal Care', 'Gifts', 'Donations', 'Custom'],
};

export default function AddExpenseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [amountError, setAmountError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleAmountChange = (text: string) => {
    // Remove any non-digit characters
    const cleanedText = text.replace(/[^0-9]/g, '');
    
    // Limit to reasonable amount (10 digits max)
    if (cleanedText.length <= 10) {
      setAmount(cleanedText);
      setAmountError('');
    }
  };

  const formatAmount = (amountText: string) => {
    if (!amountText) return '';
    
    // Add commas for thousands separator
    const number = parseInt(amountText, 10);
    return number.toLocaleString('en-IN');
  };

  const handleSave = async () => {
    console.log('Save button pressed!');
    console.log('Title:', title);
    console.log('Amount:', amount);
    console.log('Category:', selectedCategory);
    console.log('Tag:', selectedTag);
    console.log('Date:', date);
    
    if (!title.trim()) {
      console.log('Title validation failed');
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (title.trim().length > 50) {
      console.log('Title length validation failed');
      Alert.alert('Error', 'Title cannot be longer than 50 characters');
      return;
    }
    if (!amount.trim()) {
      console.log('Amount validation failed');
      setAmountError('Please enter an amount');
      return;
    }
    if (parseInt(amount, 10) === 0) {
      console.log('Amount zero validation failed');
      setAmountError('Amount cannot be zero');
      return;
    }
    if (!selectedCategory) {
      console.log('Category validation failed');
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!selectedTag) {
      console.log('Tag validation failed');
      Alert.alert('Error', 'Please select a tag');
      return;
    }
    if (date > today) {
      console.log('Date validation failed');
      Alert.alert('Error', 'Cannot add future date transactions');
      return;
    }

    console.log('All validations passed, starting save process');
    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId') || '';
      const expenseData: AddExpenseRequest = {
        userId: userId,
        title: title.trim(),
        amount: parseInt(amount, 10),
        expenseDate: date,
        category: selectedCategory,
        tag: selectedTag,
        remarks: remarks.trim() || '',
      };

      console.log('📤 Sending expense data to API:', expenseData);
      
      // Call the API
      const result = await addExpense(expenseData);
      
      console.log('✅ Expense added successfully:', result);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Auto navigate after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace('/(tabs)');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to add expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedTag(''); // Reset tag when category changes
    setShowCategoryModal(false);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setShowTagModal(false);
  };

  const getAvailableTags = () => {
    return categoryTags[selectedCategory as keyof typeof categoryTags] || [];
  };

  const handleDateSelect = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    if (dateString > today) {
      Alert.alert('Error', 'Cannot select future dates');
      return;
    }
    setDate(dateString);
    setShowDateModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = currentDate.toISOString().split('T')[0];
      const isSelected = dateString === date;
      const isToday = dateString === today;
      const isFuture = dateString > today;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.selectedDay,
            isToday && styles.today,
            isFuture && styles.futureDay,
          ]}
          onPress={() => !isFuture && handleDateSelect(currentDate)}
          disabled={isFuture}
        >
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.selectedDayText,
              isToday && styles.todayText,
              isFuture && styles.futureDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter expense title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
              maxLength={50}
            />
            <Text style={styles.characterCount}>{title.length}/50</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.amountInput, amountError && styles.amountInputError]}
                placeholder="0"
                keyboardType="numeric"
                value={formatAmount(amount)}
                onChangeText={handleAmountChange}
                placeholderTextColor="#999"
                maxLength={15} // Account for commas
                returnKeyType="done"
                onBlur={() => {
                  if (!amount.trim()) {
                    setAmountError('Please enter an amount');
                  }
                }}
                onFocus={() => setAmountError('')}
              />
            </View>
            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : (
              <Text style={styles.amountHint}>Enter amount in digits only</Text>
            )}
          </View>

          {/* Category Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.dropdownText, !selectedCategory && styles.placeholderText]}>
                {selectedCategory || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tag Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Tag</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !selectedCategory && styles.disabledButton]}
              onPress={() => selectedCategory && setShowTagModal(true)}
              disabled={!selectedCategory}
            >
              <Text style={[styles.dropdownText, !selectedTag && styles.placeholderText]}>
                {selectedTag || 'Select tag'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Date Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDateModal(true)}
            >
              <Text style={styles.dropdownText}>
                {formatDate(date)}
              </Text>
              <Ionicons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.dateHint}>Default: Today (Cannot select future dates)</Text>
          </View>

          {/* Remarks Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Remarks (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.remarksInput]}
              placeholder="Add any additional notes..."
              value={remarks}
              onChangeText={setRemarks}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Expense</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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

      {/* Date Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarContainer}>
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth('prev')}>
                  <Ionicons name="chevron-back" size={24} color="#4264ED" />
                </TouchableOpacity>
                <Text style={styles.calendarMonthText}>
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <TouchableOpacity onPress={() => changeMonth('next')}>
                  <Ionicons name="chevron-forward" size={24} color="#4264ED" />
                </TouchableOpacity>
              </View>
              
              {/* Day Names */}
              <View style={styles.calendarDaysHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.calendarDayName}>
                    {day}
                  </Text>
                ))}
              </View>
              
              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {renderCalendar()}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>Expense added successfully</Text>
            <View style={styles.successLoadingContainer}>
              <ActivityIndicator size="small" color="#4264ED" />
              <Text style={styles.successLoadingText}>Redirecting to home...</Text>
            </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    color: '#1a1a1a',
  },
  remarksInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  amountSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4264ED',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    borderWidth: 0,
  },
  amountInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  amountHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#999',
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4264ED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectedDay: {
    backgroundColor: '#4264ED',
    borderRadius: 20,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  today: {
    borderWidth: 2,
    borderColor: '#4264ED',
    borderRadius: 20,
  },
  todayText: {
    color: '#4264ED',
    fontWeight: '600',
  },
  futureDay: {
    opacity: 0.3,
  },
  futureDayText: {
    color: '#ccc',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  successLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successLoadingText: {
    fontSize: 14,
    color: '#4264ED',
    marginLeft: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
}); 