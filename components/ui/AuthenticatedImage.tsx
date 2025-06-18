import { FoodService } from '@/services/foodService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, Text, View } from 'react-native';

interface AuthenticatedImageProps {
  uri: string;
  style: StyleProp<ImageStyle>;
  onError?: (error: any) => void;
  placeholder?: React.ReactNode;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  uri,
  style,
  onError,
  placeholder
}) => {
  const [imageUri, setImageUri] = useState<string>(uri);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const processImageUri = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Fix the URI if it has problematic parameters
        const fixedUri = FoodService.fixImageUrl(uri);
        setImageUri(fixedUri);
      } catch (err) {
        console.error('Error processing image URI:', err);
        setError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    if (uri) {
      processImageUri();
    } else {
      setLoading(false);
    }
  }, [uri]);

  const handleImageError = (errorEvent: any) => {
    console.error('Image load error:', errorEvent.nativeEvent?.error || 'Unknown error');
    setError(true);
    onError?.(errorEvent);
  };

  if (loading) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
        <Text style={{ color: '#999', fontSize: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (error || !imageUri) {
    return placeholder || (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
        <Ionicons name="image" size={40} color="#ccc" />
        <Text style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
          {error ? 'Image unavailable' : 'No image'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      onError={handleImageError}
      onLoad={() => setError(false)}
    />
  );
};
