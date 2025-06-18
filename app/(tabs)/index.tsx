import { ThemeDemo } from '@/components/demo/ThemeDemo';
import HomeScreen from '@/components/home/HomeScreen';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeTab() {
  const [showDemo, setShowDemo] = useState(false);
  
  if (showDemo) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => setShowDemo(false)}
        >
          <Text style={styles.toggleText}>← Back to Home</Text>
        </TouchableOpacity>
        <ThemeDemo />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.demoButton} 
        onPress={() => setShowDemo(true)}
      >
        <Text style={styles.demoText}>🎨 View Theme Demo</Text>
      </TouchableOpacity>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  demoButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#1f4a3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  demoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#1f4a3c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 8,
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
