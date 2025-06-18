import { CustomButton } from '@/components/CustomButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CustomColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ThemeDemo() {
  const [switchValue, setSwitchValue] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="title" style={styles.title}>
            Theme Demo - {colorScheme === 'dark' ? 'Dark' : 'Light'} Mode
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            This demonstrates the consistent theming across all components using your custom color palette.
          </ThemedText>
        </ThemedView>

        {/* Color Swatches */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Custom Color Palette
          </ThemedText>
          
          <View style={styles.colorGrid}>
            <View style={styles.colorSwatch}>
              <View style={[styles.colorBox, { backgroundColor: CustomColors.darkForestGreen }]} />
              <ThemedText style={styles.colorLabel}>Primary Green</ThemedText>
            </View>
            
            <View style={styles.colorSwatch}>
              <View style={[styles.colorBox, { backgroundColor: CustomColors.darkGreen }]} />
              <ThemedText style={styles.colorLabel}>Accent Green</ThemedText>
            </View>
            
            <View style={styles.colorSwatch}>
              <View style={[styles.colorBox, { backgroundColor: CustomColors.blue }]} />
              <ThemedText style={styles.colorLabel}>Blue</ThemedText>
            </View>
            
            <View style={styles.colorSwatch}>
              <View style={[styles.colorBox, { backgroundColor: textColor }]} />
              <ThemedText style={styles.colorLabel}>Text Color</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Buttons */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Button Variants
          </ThemedText>
          
          <View style={styles.buttonGrid}>
            <CustomButton title="Primary Button" variant="primary" onPress={() => {}} />
            <CustomButton title="Secondary Button" variant="secondary" onPress={() => {}} />
            <CustomButton title="Outline Button" variant="outline" onPress={() => {}} />
            <CustomButton title="Danger Button" variant="danger" onPress={() => {}} />
          </View>
        </ThemedView>

        {/* Input Elements */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Input Elements
          </ThemedText>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: surfaceColor, 
              borderColor, 
              color: textColor 
            }]}
            placeholder="Type something here..."
            placeholderTextColor={iconColor}
            value={inputText}
            onChangeText={setInputText}
          />
          
          <View style={styles.switchRow}>
            <ThemedText>Enable notifications</ThemedText>
            <Switch
              value={switchValue}
              onValueChange={setSwitchValue}
              trackColor={{ false: iconColor + '40', true: tintColor + '40' }}
              thumbColor={switchValue ? tintColor : '#f4f3f4'}
            />
          </View>
        </ThemedView>

        {/* Icons and Actions */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Icons & Actions
          </ThemedText>
          
          <View style={styles.iconGrid}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: surfaceColor }]}>
              <Ionicons name="heart-outline" size={24} color={tintColor} />
              <ThemedText style={styles.iconLabel}>Favorite</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: surfaceColor }]}>
              <Ionicons name="share-outline" size={24} color={tintColor} />
              <ThemedText style={styles.iconLabel}>Share</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: surfaceColor }]}>
              <Ionicons name="bookmark-outline" size={24} color={tintColor} />
              <ThemedText style={styles.iconLabel}>Save</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: surfaceColor }]}>
              <Ionicons name="settings-outline" size={24} color={iconColor} />
              <ThemedText style={styles.iconLabel}>Settings</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Status Elements */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Status Elements
          </ThemedText>
          
          <View style={styles.statusGrid}>
            <View style={[styles.statusItem, { backgroundColor: '#34c759' + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#34c759" />
              <ThemedText style={[styles.statusText, { color: '#34c759' }]}>Success</ThemedText>
            </View>
            
            <View style={[styles.statusItem, { backgroundColor: '#ff9500' + '20' }]}>
              <Ionicons name="warning" size={20} color="#ff9500" />
              <ThemedText style={[styles.statusText, { color: '#ff9500' }]}>Warning</ThemedText>
            </View>
            
            <View style={[styles.statusItem, { backgroundColor: '#ff3b30' + '20' }]}>
              <Ionicons name="close-circle" size={20} color="#ff3b30" />
              <ThemedText style={[styles.statusText, { color: '#ff3b30' }]}>Error</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Typography */}
        <ThemedView style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Typography
          </ThemedText>
          
          <ThemedText type="title" style={styles.demoText}>Title Text</ThemedText>
          <ThemedText type="subtitle" style={styles.demoText}>Subtitle Text</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.demoText}>Bold Text</ThemedText>
          <ThemedText type="default" style={styles.demoText}>Regular Text</ThemedText>
          <ThemedText type="link" style={styles.demoText}>Link Text</ThemedText>
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    alignItems: 'center',
    flex: 1,
    minWidth: 70,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonGrid: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: 70,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  demoText: {
    marginBottom: 8,
  },
});
