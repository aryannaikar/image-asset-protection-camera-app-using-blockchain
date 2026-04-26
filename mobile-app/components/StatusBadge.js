import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'authentic':
        return {
          label: 'AUTHENTIC',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          iconName: 'shield-checkmark',
        };
      case 'tampered':
        return {
          label: 'TAMPERED',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
          iconName: 'warning',
        };
      default:
        return {
          label: 'UNREGISTERED',
          color: '#94a3b8',
          bg: 'rgba(148, 163, 184, 0.1)',
          iconName: 'help-circle',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.color + '33' }]}>
      <Ionicons name={config.iconName} size={14} color={config.color} style={styles.icon} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default StatusBadge;
