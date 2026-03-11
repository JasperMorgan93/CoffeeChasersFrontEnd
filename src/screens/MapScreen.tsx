import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN } from '../config/env';
import { getCafes } from '../api/cafes';
import type { Cafe } from '../types/api';

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const fallbackViewState: ViewState = {
  longitude: -0.1276,
  latitude: 51.5072,
  zoom: 10
};

export default function MapScreen() {
  const [viewState, setViewState] = useState<ViewState>(fallbackViewState);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [permission, cafeData] = await Promise.all([
          Location.requestForegroundPermissionsAsync(),
          getCafes()
        ]);

        setCafes(cafeData);

        if (permission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          setViewState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 12
          });
        } else if (cafeData.length > 0) {
          setViewState({
            latitude: cafeData[0].lat,
            longitude: cafeData[0].long,
            zoom: 12
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load map data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, []);

  const hasMapToken = useMemo(() => MAPBOX_ACCESS_TOKEN.trim().length > 0, []);

  useEffect(() => {
    if (hasMapToken) {
      Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
    }
  }, [hasMapToken]);

  if (!hasMapToken) {
    return (
      <View style={[styles.centered, styles.screen]}>
        <Text style={styles.title}>Map token missing</Text>
        <Text style={styles.bodyText}>
          Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2f5d50" />
          <Text style={styles.bodyText}>Loading cafes and your location...</Text>
        </View>
      ) : (
        <>
          <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
            <Mapbox.Camera
              zoomLevel={viewState.zoom}
              centerCoordinate={[viewState.longitude, viewState.latitude]}
              animationMode="flyTo"
              animationDuration={700}
            />

            {cafes.map((cafe) => (
              <Mapbox.PointAnnotation
                key={cafe.id.toString()}
                id={cafe.id.toString()}
                coordinate={[cafe.long, cafe.lat]}
                onSelected={() => setSelectedCafe(cafe)}
              >
                <View style={styles.marker} />
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>

          {selectedCafe ? (
            <View style={styles.card}>
              <Text style={styles.title}>{selectedCafe.name}</Text>
              <Text style={styles.bodyText}>
                Lat: {selectedCafe.lat.toFixed(5)} | Long: {selectedCafe.long.toFixed(5)}
              </Text>
              <Pressable style={styles.button} onPress={() => setSelectedCafe(null)}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f0e6'
  },
  map: {
    flex: 1
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#d46a3a'
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(247, 242, 232, 0.96)',
    borderColor: '#d4c3ab',
    borderWidth: 1,
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f4038'
  },
  bodyText: {
    fontSize: 14,
    color: '#4e5f56'
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#2f5d50',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  errorBanner: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: '#8b2f2f',
    borderRadius: 10,
    padding: 10
  },
  errorText: {
    color: '#fff',
    textAlign: 'center'
  }
});
