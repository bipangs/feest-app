import { FoodService } from '@/services/foodService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp, Text, View } from 'react-native';

interface AuthenticatedImageProps {
  uri: string | URL;
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
  const [imageUrl, setImageUrl] = useState<string>(uri instanceof URL ? uri.toString() : uri);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const processImageUrl = async () => {
      try {
        setLoading(true);
        setError(false);
          // Convert URL to string if needed, then fix the URL if it has problematic parameters
        const urlString = uri instanceof URL ? uri.toString() : uri;
        const fixedUrl = FoodService.fixImageUrl(urlString);
        setImageUrl(fixedUrl.toString());
      } catch (err) {
        console.error('Error processing image URL:', err);
        setError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    if (uri) {
      processImageUrl();
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

  if (error || !imageUrl) {
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
      source={{ uri: imageUrl }}
      style={style}
      onError={handleImageError}
      onLoad={() => setError(false)}
    />
  );
};
