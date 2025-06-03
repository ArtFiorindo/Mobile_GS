import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/src/screens/auth/LoginScreen';
import HomeScreen from '@screens/HomeScreen';
import { RootStackParamList } from '../types/navigation.types';


const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  isAuthenticated: boolean;
}

const AppNavigator = ({ isAuthenticated }: AppNavigatorProps): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Login'}
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;