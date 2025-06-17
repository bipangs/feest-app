import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { FoodService } from '@/services/foodService';
import { FoodCategory, FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { FoodCamera } from './FoodCamera';

interface AddFoodFormProps {
  onFoodAdded: () => void;
  onCancel: () => void;
}

export const AddFoodForm: React.FC<AddFoodFormProps> = ({
  onFoodAdded,
  onCancel,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<FoodCategory>('other');
  const [location, setLocation] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories: { value: FoodCategory; label: string }[] = [
    { value: 'fruits', label: '🍎 Fruits' },
    { value: 'vegetables', label: '🥕 Vegetables' },
    { value: 'grains', label: '🌾 Grains' },
    { value: 'dairy', label: '🥛 Dairy' },
    { value: 'meat', label: '🥩 Meat' },
    { value: 'baked-goods', label: '🍞 Baked Goods' },
    { value: 'prepared-meals', label: '🍽️ Prepared Meals' },
    { value: 'beverages', label: '🥤 Beverages' },
    { value: 'other', label: '📦 Other' },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please take a photo of the food');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      // Upload image first
      const fileName = `food_${Date.now()}.jpg`;
      const uploadedImageUri = await FoodService.uploadFoodImage(imageUri, fileName);

      // Create food item
      const foodData: Omit<FoodItem, '$id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim(),
        imageUri: uploadedImageUri,
        expiryDate,
        status: 'available',
        ownerId: user.$id,
        ownerName: user.name || user.email,
        location: location.trim(),
        category,
      };

      await FoodService.createFoodItem(foodData);
      Alert.alert('Success', 'Food item added successfully!');
      onFoodAdded();    } catch (error) {
      console.error('Error adding food item:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('not authenticated')) {
        Alert.alert(
          'Authentication Required', 
          'Please log out and log back in to continue adding food items.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add food item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || expiryDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpiryDate(currentDate);
  };

  const handleImageCaptured = (uri: string) => {
    setImageUri(uri);
    setShowCamera(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food Item</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo *</Text>
          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={() => setShowCamera(true)}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={40} color={Colors.light.tabIconDefault} />
                <Text style={styles.photoPlaceholderText}>Take Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Fresh Apples"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the food item, quantity, etc."
            placeholderTextColor={Colors.light.tabIconDefault}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  category === cat.value && styles.categoryButtonSelected,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat.value && styles.categoryButtonTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Expiry Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(expiryDate)}</Text>
            <Ionicons name="calendar" size={20} color={Colors.light.tabIconDefault} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Downtown area"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding...' : 'Add Food Item'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={expiryDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      <FoodCamera
        visible={showCamera}
        onImageCaptured={handleImageCaptured}
        onCancel={() => setShowCamera(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderStyle: 'dashed',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.light.tint,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.tabIconDefault,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
