import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootTabParamList = {
  Map: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2f5d50',
        tabBarStyle: {
          backgroundColor: '#f7f2e8',
          borderTopColor: '#e4dccc'
        }
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
