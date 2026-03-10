import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL, MAPBOX_ACCESS_TOKEN } from '../config/env';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Environment</Text>

      <View style={styles.card}>
        <Text style={styles.label}>API base URL</Text>
        <Text style={styles.value}>{API_BASE_URL}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Mapbox token</Text>
        <Text style={styles.value}>{MAPBOX_ACCESS_TOKEN ? 'Configured' : 'Missing'}</Text>
      </View>

      <Text style={styles.header}>Current API routes wired</Text>
      <View style={styles.card}>
        <Text style={styles.value}>GET /cafes/</Text>
        <Text style={styles.value}>GET /cafes/{'{id}'}</Text>
        <Text style={styles.value}>POST /cafes/</Text>
        <Text style={styles.value}>PUT /cafes/{'{id}'}</Text>
        <Text style={styles.value}>DELETE /cafes/{'{id}'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>GET /users/</Text>
        <Text style={styles.value}>GET /users/{'{id}'}</Text>
        <Text style={styles.value}>POST /users/</Text>
        <Text style={styles.value}>PUT /users/{'{id}'}</Text>
        <Text style={styles.value}>DELETE /users/{'{id}'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.value}>POST /reviews/</Text>
        <Text style={styles.value}>GET /reviews/{'{id}'}</Text>
        <Text style={styles.value}>PUT /reviews/{'{id}'}</Text>
        <Text style={styles.value}>DELETE /reviews/{'{id}'}</Text>
        <Text style={styles.value}>GET /reviews/customer/{'{user_id}'}</Text>
      </View>

      <Text style={styles.note}>
        This API is currently unauthenticated. Add token support in src/api/client.ts when auth routes are available.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f0e6'
  },
  content: {
    padding: 20,
    gap: 14
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f4038'
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d6ccb8',
    backgroundColor: '#fffaf0',
    padding: 14,
    gap: 5
  },
  label: {
    fontSize: 13,
    color: '#5c6b63'
  },
  value: {
    fontSize: 14,
    color: '#2f4038',
    fontWeight: '600'
  },
  note: {
    marginTop: 8,
    fontSize: 13,
    color: '#5c6b63'
  }
});
