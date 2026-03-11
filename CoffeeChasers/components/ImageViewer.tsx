import { Image, type ImageSource } from 'expo-image';
import { ImageStyle, StyleProp, StyleSheet } from 'react-native';

type ImageViewerProps = {
  source: ImageSource;
  opacity?: number;
  style?: StyleProp<ImageStyle>;
};

export function ImageViewer({ source, opacity = 0.35, style }: ImageViewerProps) {
  return (
    <Image
      source={source}
      style={[styles.backgroundImage, style, { opacity }]}
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
});
