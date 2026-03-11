import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: 'Coffee Chasers',
        headerStyle: {
          backgroundColor: '#af8874',
        },
        headerTintColor: '#352924',
        tabBarStyle: {
          backgroundColor: '#af8874',
        },
        tabBarActiveTintColor: '#352924',
        tabBarInactiveTintColor: 'rgba(53, 41, 36, 0.6)',
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
        }}
      />
      <Tabs.Screen name="not-found" />
    </Tabs>
  );
}
