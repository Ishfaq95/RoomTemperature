import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import SunCalc from 'suncalc';
import Svg, {Circle, Path, Image as SvgImage} from 'react-native-svg';

const SunPosition = () => {
  const [sunPosition, setSunPosition] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message:
                'This app needs access to your location to calculate the sun position.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              position => {
                const {latitude, longitude} = position.coords;
                const date = new Date();
                const sunPos = SunCalc.getPosition(date, latitude, longitude);
                const azimuth = (sunPos.azimuth * 180) / Math.PI;
                const altitude = (sunPos.altitude * 180) / Math.PI;
                setSunPosition({azimuth, altitude});
              },
              error => {
                setErrorMessage(error.message);
                console.error(error);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          } else {
            setErrorMessage('Location permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    getLocation();
  }, []);

  const getSunIconPosition = () => {
    if (!sunPosition) return {x: 0, y: 0};
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    const angle = (sunPosition.altitude * Math.PI) / 180;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY - radius * Math.sin(angle);

    return {x, y};
  };

  const {x, y} = getSunIconPosition();

  return (
    <View style={styles.container}>
      {sunPosition ? (
        <Svg height="300" width="300">
          <Path
            d="M50,200 Q150,50 250,200"
            stroke="white"
            strokeWidth="2"
            fill={70}
            strokeDasharray="5,5"
          />
          <SvgImage
            href={require('../assets/images/weatherImages/sun.png')}
            x={x - 95} // Adjust based on icon size
            y={y - 95} // Adjust based on icon size
            width="15"
            height="15"
          />
        </Svg>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {errorMessage || 'Calculating sun position...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default SunPosition;
