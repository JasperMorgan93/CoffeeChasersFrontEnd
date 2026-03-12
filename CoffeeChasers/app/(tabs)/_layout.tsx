import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: 'Coffee Chasers',
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontFamily: TYPOGRAPHY.fontFamily.bold,
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          height: 72,
        },
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: COLORS.textPrimaryMuted,
        tabBarLabelStyle: {
          fontFamily: TYPOGRAPHY.fontFamily.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
<Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'cafe' : 'cafe-outline'}
              size={26}
              color={COLORS.background}
            />
          ),
          tabBarButton: (props) => (
            <Pressable
              onPress={props.onPress}
              onLongPress={props.onLongPress}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              style={({ pressed }) => [
                styles.reviewTabButton,
                pressed && styles.reviewTabButtonPressed,
              ]}
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  reviewTabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.textPrimary,
    borderWidth: 3,
    borderColor: COLORS.background,
    marginTop: -20,
    elevation: 4,
  },
  reviewTabButtonPressed: {
    opacity: 0.85,
  },
});
