import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationSettings from '../../components/NotificationSettings';
import PinSettings from '../../components/PinSettings';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings" size={24} color="#333" />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <PinSettings />
        <NotificationSettings />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Ionicons name="calculator" size={20} color="#007AFF" />
              <Text style={styles.featureText}>Expense Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="#34C759" />
              <Text style={styles.featureText}>Lend Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cash-outline" size={20} color="#FF3B30" />
              <Text style={styles.featureText}>Split Expenses  <Ionicons name="notifications" size={16} color="#007AFF" /></Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cash-outline" size={20} color="#FF3B30" />
              <Text style={styles.featureText}>Investments Tracker  <Ionicons name="notifications" size={16} color="#007AFF" /></Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed" size={20} color="#FF9500" />
              <Text style={styles.featureText}>PIN Protection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications" size={20} color="#AF52DE" />
              <Text style={styles.featureText}>Daily Reminders</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color="#FF3B30" />
              <Text style={styles.featureText}>Statistics & Reports</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2025.1.1</Text>
            </View>
          </View>
        </View>
        <Text style={{textAlign: 'center', fontSize: 16, color: '#333', paddingBottom: 30}}>Made in INDIA 🇮🇳</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
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
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default SettingsScreen; 