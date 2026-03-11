import { Text, View, StyleSheet } from 'react-native';
import { ImageViewer } from '../../components/ImageViewer';

export default function Index() {
  return (
    <View style={styles.container}>
      <ImageViewer
        source={require('../../assets/images/splash-icon.png')}
      />
      <Text style={styles.text}>Coffee Chasers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#352924',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#af8874',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
