import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

const CustomDrawerContent = props => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Weather</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#063855', // Set the background color for the header
    padding: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  headerText: {
    color: 'white', // Set the text color for the header
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
