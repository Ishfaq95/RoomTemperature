import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreenWeather from '../screens/DrawerScreens/home';
import ManageLocation from '../screens/DrawerScreens/manageLocation';
import Notification from '../screens/DrawerScreens/notification';
import PrivacyPolicy from '../screens/DrawerScreens/privacy';
import RateThisApp from '../screens/DrawerScreens/rateApp';
import ShareWeather from '../screens/DrawerScreens/shareWeather';
import Units from '../screens/DrawerScreens/units';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

import CustomDrawerContent from '../constants/customDrawer';
import {Image} from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="homeWeather"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#063855',
        },
        drawerLabelStyle: {
          color: '#fff', // Ensure the text color is white
        },
      }}>
      <Drawer.Screen
        name="homeWeather"
        component={HomeScreenWeather}
        options={{
          drawerLabel: 'Home',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/home.png')}
            />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="location"
        component={ManageLocation}
        options={{
          drawerLabel: 'Manage Location',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/location.png')}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="unit"
        component={Units}
        options={{
          drawerLabel: 'Units',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/unit.png')}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="notification"
        component={Notification}
        options={{
          drawerLabel: 'Notification',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/notification.png')}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="privacy"
        component={PrivacyPolicy}
        options={{
          drawerLabel: 'Privacy Policy',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/privacy.png')}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="rate"
        component={RateThisApp}
        options={{
          drawerLabel: 'Rate This App',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/rate.png')}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="share"
        component={ShareWeather}
        options={{
          drawerLabel: 'Share Weather',
          drawerIcon: () => (
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/images/weatherImages/share.png')}
            />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
