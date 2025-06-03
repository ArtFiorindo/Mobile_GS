import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/src/screens/auth/LoginScreen';
import HomeScreen from '@screens/HomeScreen';
import { RootStackParamList } from '../types/navigation.types';


const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;