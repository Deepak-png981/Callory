import React from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './routes';
import {useAppContext} from '../store/app-context';
import {AllowedContactsScreen} from '../screens/allowed-contacts/allowed-contacts-screen';
import {TemplateEditorScreen} from '../screens/modes/template-editor-screen';
import {OnboardingScreen} from '../screens/onboarding/onboarding-screen';
import {SetupPermissionsScreen} from '../screens/setup-permissions/setup-permissions-screen';
import {LoadingScreen} from '../screens/shared/loading-screen';
import {useTheme} from '../ui/theme';
import {MainTabs} from './main-tabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {state, isHydrated} = useAppContext();
  const theme = useTheme();

  if (!isHydrated) return <LoadingScreen />;

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={state.hasCompletedOnboarding ? 'mainTabs' : 'onboarding'}
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {backgroundColor: theme.colors.surface},
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: {backgroundColor: theme.colors.background},
        }}>
        <Stack.Screen
          name="onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="mainTabs" component={MainTabs} options={{headerShown: false}} />
        <Stack.Screen
          name="allowedContacts"
          component={AllowedContactsScreen}
          options={{title: 'Allow List'}}
        />
        <Stack.Screen
          name="templateEditor"
          component={TemplateEditorScreen}
          options={{title: 'Edit Mode'}}
        />
        <Stack.Screen
          name="setupPermissions"
          component={SetupPermissionsScreen}
          options={{title: 'Setup'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


