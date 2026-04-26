import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GradientButton = ({ title, onPress, iconName, loading, colors = ['#6366f1', '#4f46e5'], style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.content}>
            {iconName && (
              <Ionicons name={iconName} size={18} color="#fff" style={styles.icon} />
            )}
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
    width: '100%',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 10,
  },
});

export default GradientButton;
