import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';

export default function About() {
  const handleLearnMore = () => {
    Alert.alert('Coffee Chasers', 'More details coming soon.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.subtitle}>Coffee Chasers</Text>
      <AppButton
        label="Learn More"
        onPress={handleLearnMore}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#af8874',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#352924',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#352924',
  },
  button: {
    marginTop: 16,
  },
});
