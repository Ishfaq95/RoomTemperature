import React from 'react';
import {View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import Splash from '../screens/splash';
import OnBoarding from '../screens/onBoarding';
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="onBoard" component={OnBoarding} />

      <Stack.Screen name="drawer" component={DrawerNavigator} />
      <Stack.Screen name="detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};
export default StackNavigator;
