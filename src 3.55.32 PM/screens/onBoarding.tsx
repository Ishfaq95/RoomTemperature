import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const OnBoarding = ({navigation}) => {
  const [showComponent, setShowComponent] = useState(1);

  const SlideIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {[1, 2, 3].map(index => (
          <View
            key={index}
            style={[
              styles.indicator,
              showComponent === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  const Component1 = () => {
    return (
      <View>
        <View style={styles.circleView}>
          <Image
            source={require('../assets/images/weatherImages/sunCloud.png')}
            style={{width: 110, height: 110}}
          />
        </View>
        <View style={styles.direction}>
          <Text style={styles.title}>Indoor & Outdoor Weather</Text>
          <Text style={styles.subTitle}>
            Stay prepared indoors and outdoors with flexible weather updates.
          </Text>
        </View>
        <SlideIndicator />
      </View>
    );
  };

  const Component2 = () => {
    return (
      <View>
        <View style={styles.circleView}>
          <Image
            source={require('../assets/images/weatherImages/rain.png')}
            style={{width: 125, height: 110}}
          />
        </View>
        <View style={styles.direction}>
          <Text style={styles.title}>Real-time weather</Text>
          <Text style={styles.subTitle}>
            Stay prepared for the next 15 days with detailed weather forecasts
          </Text>
        </View>
        <SlideIndicator />
      </View>
    );
  };

  const Component3 = () => {
    return (
      <View>
        <View style={styles.circleView}>
          <Image
            source={require('../assets/images/weatherImages/snowCloud.png')}
            style={{width: 110, height: 110}}
          />
        </View>
        <View style={styles.direction}>
          <Text style={styles.title}>Long range forecast</Text>
          <Text style={styles.subTitle}>
            Stay prepared for the next 15 days with detailed weather forecasts
          </Text>
        </View>
        <SlideIndicator />
      </View>
    );
  };

  const handleContinue = () => {
    if (showComponent < 3) {
      setShowComponent(showComponent + 1);
    } else {
      navigation.navigate('drawer');
    }
  };

  return (
    <View style={styles.container}>
      {showComponent === 1 && <Component1 />}
      {showComponent === 2 && <Component2 />}
      {showComponent === 3 && <Component3 />}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text
          style={{
            color: '#386077',
            fontSize: 30,
          }}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#063855',
  },
  circleView: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#386077',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: hp(15),
  },
  button: {
    width: wp(90),
    backgroundColor: '#fff',
    padding: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
  },
  direction: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
  },
  subTitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(3),
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeIndicator: {
    width: 35,
    backgroundColor: '#fff',
  },
});
