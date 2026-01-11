import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {HomeScreen} from '../screens/home/home-screen';
import {SettingsScreen} from '../screens/settings/settings-screen';
import {ModesScreen} from '../screens/modes/modes-screen';
import {PillTabBar} from './pill-tab-bar';

export type MainTabParamList = {
  homeTab: undefined;
  modesTab: undefined;
  settingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <PillTabBar {...props} />}>
      <Tab.Screen name="homeTab" component={HomeScreen} options={{title: 'Home'}} />
      <Tab.Screen name="modesTab" component={ModesScreen} options={{title: 'Modes'}} />
      <Tab.Screen name="settingsTab" component={SettingsScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}

