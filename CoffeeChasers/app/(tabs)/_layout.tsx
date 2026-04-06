import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { UI } from '../../constants/ui';

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
          fontFamily: TYPOGRAPHY.fontFamily.logo,
          fontSize: UI.tabs.headerTitleSize,
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          height: UI.tabs.tabBarHeight,
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
              size={UI.tabs.reviewIconSize}
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
    width: UI.tabs.reviewButtonSize,
    height: UI.tabs.reviewButtonSize,
    borderRadius: UI.tabs.reviewButtonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.textPrimary,
    borderWidth: UI.tabs.reviewButtonBorderWidth,
    borderColor: COLORS.background,
    marginTop: UI.tabs.reviewButtonMarginTop,
    elevation: UI.tabs.reviewButtonElevation,
  },
  reviewTabButtonPressed: {
    opacity: UI.button.pressedOpacity,
  },
});
