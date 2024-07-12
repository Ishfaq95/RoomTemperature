import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import moment from 'moment';
import Svg, {Path, Circle} from 'react-native-svg';

// Import your API functions
import {FetchWeatherForcast, FetchWeatherLocation} from '../api/WeatherAPI';

const SunMoonMovement = ({sunrise, sunset, moonrise, moonset}) => {
  const parseTime = timeStr => moment(timeStr, 'hh:mm A');
  const sunriseTime = parseTime(sunrise);
  const sunsetTime = parseTime(sunset);
  const moonriseTime = parseTime(moonrise);
  const moonsetTime = parseTime(moonset);

  const calcPosition = (time, startTime, endTime) => {
    const totalDuration = endTime.diff(startTime);
    const timeDuration = time.diff(startTime);
    return (timeDuration / totalDuration) * 100;
  };

  const sunPosition = calcPosition(moment(), sunriseTime, sunsetTime);
  const moonPosition = calcPosition(moment(), moonriseTime, moonsetTime);

  return (
    <View style={{alignItems: 'center', margin: 20}}>
      <Svg height="200" width="300">
        <Path
          d="M10,150 Q150,10 290,150"
          stroke="grey"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
        />
        <Circle
          cx={10 + sunPosition * 2.8}
          cy={150 - Math.sin((sunPosition / 100) * Math.PI) * 140}
          r="10"
          fill="yellow"
        />
        <Circle
          cx={10 + moonPosition * 2.8}
          cy={150 - Math.sin((moonPosition / 100) * Math.PI) * 140}
          r="10"
          fill="white"
        />
      </Svg>
      <Text>
        Sunrise: {sunrise} | Sunset: {sunset}
      </Text>
      <Text>
        Moonrise: {moonrise} | Moonset: {moonset}
      </Text>
    </View>
  );
};

export default SunMoonMovement;
