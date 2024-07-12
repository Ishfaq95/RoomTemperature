import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, StatusBar} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Splash = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('onBoard');
    }, 3000);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#063855" />
      <View style={styles.circleView}>
        <Image
          style={{width: 110, height: 110}}
          source={require('../assets/images/weatherImages/sun.png')}
        />
      </View>
      <Text style={styles.weatherText}>Weather App</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#063855',
  },
  text: {
    fontSize: 20,
  },
  circleView: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#386077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherText: {
    color: '#fff',
    fontSize: 42,
    textAlign: 'center',
    marginVertical: hp(2),
    fontWeight: 'bold',
  },
});
export default Splash;
