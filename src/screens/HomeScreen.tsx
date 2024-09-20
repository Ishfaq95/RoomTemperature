import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeModules,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Svg, { Image as SvgImage, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import LineProgressWithTitle from "../constants/circleProgress";
import Geolocation from "react-native-geolocation-service";
import { FetchWeatherForcast, FetchWeatherLocation } from "../api/weatherApi";
import { windowHeight, windowWidth } from "../constants/Dimension";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SunPosition from "../constants/sunMoon";
import SunCalc from "suncalc";
import { format, parse, differenceInMinutes } from "date-fns";
import moment from "moment";
import { ActivityIndicator } from "react-native";

const HomeScreen = () => {
  const [show, setShow] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [tempDeg, setTempDeg] = useState("0deg");
  const [tempHeight, setTempHeight] = useState(0);
  const debounce = require("lodash/debounce");
  const WidthScreen = Dimensions.get("screen");
  const [newCity, setNewCity] = useState("");
  const [byDefaultCity, setByDefaultCity] = useState("");

  const [city, setCity] = useState("");
  // const windowHeight = Dimensions.get('window').height;
  const [temperature, setTemperature] = useState<string | null>(null);
  const [convertedTemp, setConvertedTemp] = useState(`${temperature} °C`);
  const { BatteryModule, TemperatureModule } = NativeModules;
  const billAnimatedView = useRef(new Animated.Value(0)).current;
  const getBatteryTemperature = async () => {
    try {
      const temperature = await BatteryModule.getBatteryTemperature();
      const temp = parseFloat(temperature);
      if (!isNaN(temp)) {
        setConvertedTemp(`${(temp - 6.5).toFixed(1)} °C`);
        setTemperature(`${(temp - 6.5).toFixed(1)} °C`);
      }
      // console.log(`Battery Temperature: ${temperature.toFixed(2)}°C`);
    } catch (e) {
      console.error(e);
    }
  };
  const getTemperature = async () => {
    try {
      const temperature = await TemperatureModule.getTemperature();
      // console.log(`Temperature: ${temperature}°C`);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    getTemperature();
    getBatteryTemperature();
  }, []);

  const handleLocation = (loc) => {
    setLocations([]);
    setShow(false);
    setLoading(true);

    // Save the selected city to AsyncStorage
    AsyncStorage.setItem("LOCATION", loc.name)
      .then(() => {
        // Update the city state after saving it to AsyncStorage
        setCity(loc.name);

        // Fetch weather data for the selected city
        FetchWeatherForcast({
          cityName: loc.name,
          days: "7",
        })
          .then((data) => {
            setWeather(data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching weather data:", error);
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error("Error saving city to AsyncStorage:", error);
      });
  };

  const handelSearch = (value: string) => {
    FetchWeatherLocation({ cityName: value }).then((data) => {
      console.log("got data/ search///// ", data);
      setLocations(data);
    });
  };

  const weatherImages = {
    sunny: require("../assets/images/weatherImages/sunny.png"),
    clearSky: require("../assets/images/weatherImages/clearSky.png"),
    rain: require("../assets/images/weatherImages/rainBg.png"),
    snow: require("../assets/images/weatherImages/snow.png"),
    thunderstorm: require("../assets/images/weatherImages/thunderStorm.png"),
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "We need access to your location to show you the weather forecast.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log('You can use the location');
          return true;
        } else {
          // console.log('Location permission denied');
          return false;
        }
      } else {
        // For iOS, permissions are handled differently.
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // const getCurrentLocation = async () => {
  //   const hasPermission = await requestLocationPermission();
  //   if (!hasPermission) return;

  //   Geolocation.getCurrentPosition(
  //     (position) => {
  //       console.log("Current Location:", position.coords);

  //       const { latitude, longitude } = position.coords;
  //       console.log("Current Location:", latitude, longitude);

  //       FetchWeatherLocation({ lat: latitude, lon: longitude }).then((data) => {
  //         if (data && data.length > 0) {
  //           const defaultLocation = data[0];
  //           handleLocation(defaultLocation);
  //         }
  //       });
  //     },
  //     (error) => {
  //       // console.log(error.code, error.message);
  //     },
  //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //   );
  // };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      (position) => {
        console.log("Current Location:", position.coords);

        const { latitude, longitude } = position.coords;
        console.log("Latitude:", latitude, "Longitude:", longitude);

        // Now we need to perform reverse geocoding to get the city name
        reverseGeocodeLocation(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation Error:", error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Function to call the reverse geocoding API
  const reverseGeocodeLocation = async (latitude, longitude) => {
    try {
      // Example API call to OpenWeatherMap's Reverse Geocoding API
      const apiKey = "fa62b8fcda1b42acbf04eb062d274c92"; // Replace with your API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.results.length > 0) {
        const cityName =
          data.results[0].components.city ||
          data.results[0].components.town ||
          data.results[0].components.village;
        console.log("City Name from OpenCageData:", cityName);
        setByDefaultCity(cityName);

        // Call handleLocation with the city name
        handleLocation({ name: cityName });
      } else {
        console.log("No city found in OpenCageData response.");
      }
    } catch (error) {
      console.error("OpenCageData Reverse Geocoding Error:", error);
    }
  };

  // useEffect to get current location when the component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchMyWeatherData = async () => {
    try {
      const data = await FetchWeatherForcast({
        cityName: "Lahore",
        days: "7",
      });
      setWeather(data);
      setLoading(false);
      // Only set default city if there's no city saved in AsyncStorage
      if (!city) {
        setCity("Lahore");
      }
    } catch (error) {
      console.error("Error fetching weather data for default city:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);
  const handleTextDebounce = useCallback(debounce(handelSearch, 1200), []);

  const { current, location, forecast } = weather;
  console.log("location?.name---////", location?.name);

  useEffect(() => {
    setNewCity(location?.name);
  }, [location?.name]);

  useEffect(() => {
    const getStoredCity = async () => {
      try {
        const storedCity = await AsyncStorage.getItem("LOCATION");
        if (storedCity) {
          setCity(storedCity);

          // Fetch weather for the stored city
          const data = await FetchWeatherForcast({
            cityName: storedCity,
            days: "7",
          });
          setWeather(data);
          setLoading(false);
        } else {
          // Fetch weather for the default city (Lahore) if no city is stored
          await fetchMyWeatherData();
        }
      } catch (error) {
        console.error("Error retrieving city or fetching weather data:", error);
      }
    };

    getStoredCity();
  }, []);

  const astro = forecast?.forecastday[0];
  // console.log('astro', astro);

  const navigation = useNavigation();
  const openDrawer = () => {
    // console.log('helloo');

    navigation.openDrawer();
  };

  const currentDate = new Date();
  const day = currentDate.toLocaleString("en-US", { weekday: "short" });
  const time = currentDate.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const { temp_c, humidity } = weather?.current || {};
  const fillPercentage = humidity;

  // const sunRiseTime = astro?.astro?.sunrise;
  // console.log('sunRiseTime', sunRiseTime);

  // const sunSetTime = astro?.astro?.sunset;
  // console.log('sunSetTime', sunSetTime);

  // const convertTo24HourFormat = (time12h) => {
  //   if (!time12h) {
  //     return "";
  //   }

  //   const [time, modifier] = time12h.split(" ");

  //   let [hours, minutes] = time.split(":");

  //   if (hours === "12") {
  //     hours = "00";
  //   }

  //   if (modifier === "PM") {
  //     hours = parseInt(hours, 10) + 12;
  //   }

  //   return `${hours}:${minutes}`;
  // };

  // const parseTimeToMinutes = (time24h) => {
  //   if (!time24h) {
  //     return 0;
  //   }

  //   const [hours, minutes] = time24h.split(":").map(Number);
  //   return hours * 60 + minutes;
  // };

  // const sunRiseTime24h = sunRiseTime
  //   ? convertTo24HourFormat(sunRiseTime)
  //   : null;
  // console.log('sunRiseTime (24-hour format):', sunRiseTime24h);

  // useEffect(() => {
  //   const sunRiseTime = astro?.astro?.sunrise;
  //   const sunSetTime = astro?.astro?.sunset;

  //   const sunRiseTime24h = sunRiseTime
  //     ? convertTo24HourFormat(sunRiseTime)
  //     : null;
  //   const sunSetTime24h = sunSetTime ? convertTo24HourFormat(sunSetTime) : null;

  //   if (sunRiseTime24h && sunSetTime24h) {
  //     const sunRiseMinutes = parseTimeToMinutes(sunRiseTime24h);
  //     const sunSetMinutes = parseTimeToMinutes(sunSetTime24h);

  //     const totalMinutes = sunSetMinutes - sunRiseMinutes;

  //     billAnimatedView.setValue(0);
  //     let angleTilt = 180;
  //     billAnimatedView.addListener(({ value }) => {
  //       // console.log('value...........', value);

  //       setTempDeg(angleTilt * value + "deg");
  //       let r = (angleTilt * value * Math.PI) / 180;
  //       setTempHeight(87 - 87 * Math.cos(r));
  //     });

  //     StartAnimation(totalMinutes);
  //   }
  // }, [astro]);

  // const timeCurrent = new Date();
  // const hours = timeCurrent.getHours();
  // const minutes = timeCurrent.getMinutes();
  // const period = hours >= 12 ? "PM" : "AM";
  // const hour = hours % 12 || 12; // Convert to 12-hour format
  // const currentTimes = `${hour}:${minutes} ${period}`;
  // console.log('currentTime', currentTimes);

  // const calculateDegree = (sunriseTime, sunsetTime, currentTime) => {
  //   // Parse the times using moment
  //   const sunrise = moment(sunriseTime, "HH:mm");
  //   const sunset = moment(sunsetTime, "HH:mm");
  //   const current = moment(currentTime, "HH:mm");
  //   console.log("sunrise", sunrise);
  //   console.log("sunset", sunset);
  //   console.log("current", current);

  //   // Calculate total duration between sunrise and sunset
  //   const totalDuration = sunset.diff(sunrise, "minutes");

  //   // Calculate elapsed time since sunrise
  //   const elapsedTime = current.diff(sunrise, "minutes");

  //   // Calculate the degree
  //   const degree = (elapsedTime / totalDuration) * 180;

  //   // Ensure the degree is between 0 and 180
  //   return Math.max(0, Math.min(degree, 180));
  // };

  // useEffect(() => {
  //   setInterval(() => {
  //     let sunDegree = calculateDegree(sunRiseTime, sunSetTime, timeCurrent);
  //     console.log("sunDegree", sunDegree);
  //   }, 1000);
  // }, []);

  // // Example usage
  // const sunriseTime = sunRiseTime; // 6:00 AM
  // const sunsetTime = sunSetTime; // 6:00 PM
  // const currentTime = currentTimes; // 12:00 PM (noon)

  // const degree = calculateDegree(sunriseTime, sunsetTime, currentTime);
  // console.log(degree); // Should print 90

  // const StartAnimation = (duration) => {
  //   Animated.timing(billAnimatedView, {
  //     toValue: 1,
  //     duration: duration * 1000,
  //     useNativeDriver: true,
  //     easing: Easing.linear,
  //   }).start();
  // };

  if (!weather || !weather?.current) {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  let weatherImageSource = require("../assets/images/weatherImages/sunny.png"); // Default image
  if (current?.temp_c) {
    if (current?.temp_c >= "25") {
      weatherImageSource = weatherImages.sunny;
    } else if (current?.temp_c >= "23") {
      weatherImageSource = weatherImages.rain;
    } else if (current?.temp_c >= "20") {
      weatherImageSource = weatherImages.snow;
    } else if (current?.temp_c >= "18") {
      weatherImageSource = weatherImages.clearSky;
    } else if (current?.temp_c >= "13" || current?.temp_c <= "25") {
      weatherImageSource = weatherImages.thunderstorm;
    }
  }

  const splitTextIntoLines = (text) => {
    const words = text.split(" ");
    if (words.length <= 1) {
      return [text];
    } else {
      const firstLine = words.slice(0, 1).join(" ");
      const remainingText = words.slice(1).join(" ");
      return [firstLine, remainingText];
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* <StatusBar
        barStyle={"light-content"}
        translucent
        backgroundColor="transparent"
      /> */}
      <Image source={weatherImageSource} style={styles.backgroundImage} />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.drawerIconView}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconView}>
              <Image
                style={{ width: 45, height: 27 }}
                source={require("../assets/images/weatherImages/drawer.png")}
              />
            </TouchableOpacity>
            <View>
              {show ? (
                <View
                  style={[
                    styles.inputView,
                    {
                      backgroundColor: show
                        ? "rgba(255, 255, 255, 1.3)"
                        : "transparent",
                    },
                  ]}
                >
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="search city"
                    placeholderTextColor={"lightgray"}
                    style={{ color: "#000" }}
                  />
                </View>
              ) : (
                ""
              )}
              <TouchableOpacity
                onPress={() => setShow(!show)}
                style={styles.searchView}
              >
                <Text style={styles.searchText}>
                  {newCity ? newCity : byDefaultCity}
                </Text>
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    tintColor: "#fff",
                    bottom: 4,
                  }}
                  source={require("../assets/images/weatherImages/opt.png")}
                />
              </TouchableOpacity>
              {locations?.length > 0 && show ? (
                <View style={styles.searchTextView}>
                  {locations?.map((loc, ind) => {
                    // console.log('loc', loc);
                    const border =
                      ind + 1 != locations?.length
                        ? { borderBottomWidth: 1 }
                        : {};
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={ind}
                        style={[
                          styles.direction,
                          { borderBottomWidth: border?.borderBottomWidth },
                        ]}
                      >
                        <Entypo name="location-pin" color="gray" size={25} />
                        <Text style={{ color: "#000", fontSize: 16, top: 4 }}>
                          {loc?.name},{loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            <View style={styles.thirdView}></View>
          </View>
          <Text style={styles.timeText}>
            {day}
            {"  "} {time}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.indoorText}>INDOOR</Text>
          <View style={styles.indoorBox}>
            <View style={styles.indoorDirection}>
              <Image
                style={{ width: 52, height: 57 }}
                source={require("../assets/images/weatherImages/indoor.png")}
              />
              <Text style={[styles.indoorTemp, { fontSize: 50 }]}>
                {convertedTemp}
              </Text>
            </View>
          </View>
          <Text style={styles.indoorText}>OUTDOOR</Text>
          <View style={styles.indoorBox}>
            <View
              style={{
                width: 230,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Text
                style={[
                  styles.indoorTemp,
                  { fontSize: 90, marginHorizontal: 0 },
                ]}
              >
                {current?.temp_c}
                {"\u00B0"}
              </Text>
              <Image
                source={{ uri: "https:" + current?.condition?.icon }}
                style={{
                  width: 50,
                  height: 50,
                  top: 5,
                }}
              />
            </View>
            <Text style={[styles.sunnyText, { bottom: 19 }]}>
              {current?.condition?.text}
            </Text>
            <View
              style={[styles.indoorDirection, { width: windowWidth * 0.9 }]}
            >
              <View style={styles.iconViews}>
                <Image
                  style={{ width: 30, height: 37, tintColor: "#fff" }}
                  source={require("../assets/images/weatherImages/humidity.png")}
                />
                <Text style={styles.text}>HUMIDITY</Text>
                <Text style={styles.outdoorText}>{current?.humidity}%</Text>
              </View>
              <View style={styles.iconViews}>
                <Image
                  style={{ width: 30, height: 33, tintColor: "#fff" }}
                  source={require("../assets/images/weatherImages/wind.png")}
                />
                <Text style={styles.text}>WIND</Text>
                <Text style={styles.outdoorText}>{current?.wind_kph}km/h</Text>
              </View>
              <View style={styles.iconViews}>
                <Image
                  style={{ width: 30, height: 37, tintColor: "#fff" }}
                  source={require("../assets/images/weatherImages/feel.png")}
                />
                <Text style={styles.text}>FEELS LIKE</Text>
                <Text style={styles.outdoorText}>
                  {current?.feelslike_c}
                  {"\u00B0"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.hoursView}>
            <Text style={styles.hoursText}>Hourly Forcast</Text>
            <View style={styles.hoursIcon}>
              <Text style={styles.hoursText}>72 Hours</Text>
              <Image
                style={{ width: 24, height: 24, tintColor: "#fff" }}
                source={require("../assets/images/weatherImages/right.png")}
              />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScrollView}
          >
            {forecast?.forecastday[0]?.hour.map((hourData, index) => {
              const timeString = hourData.time.split(" ")[1];
              const timeParts = timeString.split(":");
              const time = `${timeParts[0]}:${timeParts[1]}`;

              return (
                <View key={index} style={styles.cardBox}>
                  <Text style={styles.degreeText}>
                    {hourData.temp_c}
                    {"\u00B0"}
                  </Text>
                  <Image
                    style={styles.iconImage}
                    source={{ uri: "https:" + hourData?.condition?.icon }}
                  />
                  <Text style={styles.degreeText}>{time}</Text>
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.hoursView}>
            <Text style={styles.hoursText}>DAILY FORCAST</Text>
            <View style={styles.hoursIcon}>
              <Text style={styles.hoursText}>15 Days</Text>
              <Image
                style={{ width: 24, height: 24, tintColor: "#fff" }}
                source={require("../assets/images/weatherImages/right.png")}
              />
            </View>
          </View>

          {forecast?.forecastday?.slice(0, 10)?.map((dayData, index) => (
            <View key={index} style={styles.indoorBox}>
              <View style={styles.indoorDirection}>
                <View style={styles.dayView}>
                  <Text style={styles.degree}>{dayData?.date}</Text>
                </View>
                <View style={styles.temperatureView}>
                  <Image
                    style={{ width: 45, height: 45 }}
                    source={{
                      uri: "https:" + dayData?.day?.condition?.icon,
                    }}
                  />
                  <Text style={styles.degree}>
                    {dayData.day.condition.text}
                  </Text>
                  <Text style={[styles.degree, { fontSize: 16 }]}>
                    {dayData.day.maxtemp_c}
                    {"\u00B0"}/{dayData.day.mintemp_c}
                    {"\u00B0"}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={[styles.indoorBox, { paddingVertical: 20 }]}>
            <Text style={styles.airText}>Air condition</Text>
            <View style={styles.airConditionViewBar}>
              <View style={styles.circleBarView}>
                <AnimatedCircularProgress
                  size={170}
                  width={15}
                  fill={fillPercentage}
                  tintColor="#fff"
                  onAnimationComplete={() => console.log("onAnimationComplete")}
                  backgroundColor="#95bee3"
                  arcSweepAngle={270}
                  rotation={225}
                  lineCap={"round"}
                  renderCap={({ center }) => (
                    <Svg height={150} width={150}>
                      <Circle cx={center.x} cy={center.y} r="7.5" fill="#fff" />
                    </Svg>
                  )}
                >
                  {() => (
                    <View style={styles.centerText}>
                      <Text style={styles.progressText}>{temp_c}°C</Text>
                    </View>
                  )}
                </AnimatedCircularProgress>

                <View style={[styles.capTextContainer]}>
                  <Text style={styles.capText}>
                    {weather?.current?.condition?.text}
                    {/* {weather?.current?.condition?.text &&
                      splitTextIntoLines(weather.current.condition.text).map(
                        (line, index) => <Text key={index}>{line + "\n"}</Text>
                      )} */}
                  </Text>
                </View>
              </View>
              {/* <View style={styles.lineBarView}>
                <LineProgressWithTitle
                  text={'4,7 µg/m3 '}
                  width={130}
                  height={4}
                  title={'PM2,5'}
                  value={75}
                />
                <LineProgressWithTitle
                  text={'4,7 µg/m3 '}
                  width={130}
                  height={4}
                  title={'PM10'}
                  value={75}
                />
                <LineProgressWithTitle
                  text={'4,7 µg/m3 '}
                  width={130}
                  height={4}
                  title={'O3'}
                  value={75}
                />
                <LineProgressWithTitle
                  text={'4,7 µg/m3'}
                  width={130}
                  height={4}
                  title={'NO2'}
                  value={75}
                />
                <LineProgressWithTitle
                  text={'4,7 µg/m3 '}
                  width={130}
                  height={4}
                  title={'CO'}
                  value={75}
                />
              </View> */}
            </View>
          </View>
          <View style={styles.indoorBox}>
            <View style={styles.hoursView}>
              <Text style={styles.hoursText}>Detail</Text>
              <View style={styles.hoursIcon}>
                <Text style={styles.hoursText}>More</Text>
                <Image
                  style={{ width: 24, height: 24, tintColor: "#fff" }}
                  source={require("../assets/images/weatherImages/right.png")}
                />
              </View>
            </View>

            <View style={styles.line}></View>
            <View style={styles.airConditionView}>
              <View style={styles.iconTextView}>
                <Text style={styles.uvText}>UV Index</Text>
                <View style={[styles.hoursIcon, { marginBottom: 15 }]}>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: "#fff",
                      marginHorizontal: 15,
                    }}
                    source={require("../assets/images/weatherImages/Psun.png")}
                  />
                  <Text style={[styles.hoursText, { fontSize: 24 }]}>
                    {current?.uv}
                  </Text>
                </View>
                <Text style={styles.uvText}>Precipitation</Text>
                <View style={[styles.hoursIcon, { marginBottom: 15 }]}>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: "#fff",
                      marginHorizontal: 15,
                    }}
                    source={require("../assets/images/weatherImages/rain.png")}
                  />
                  <Text style={[styles.hoursText, { fontSize: 24 }]}>
                    {current?.precip_mm}%
                  </Text>
                </View>
                <Text style={styles.uvText}>Pressure</Text>
                <View style={[styles.hoursIcon, { marginBottom: 15 }]}>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: "#fff",
                      marginHorizontal: 15,
                    }}
                    source={require("../assets/images/weatherImages/speed.png")}
                  />
                  <Text style={[styles.hoursText, { fontSize: 24 }]}>
                    {current?.pressure_mb} mbar
                  </Text>
                </View>
              </View>
              <View style={styles.iconTextView}>
                <Text style={styles.uvText}>visibility</Text>
                <View style={[styles.hoursIcon, { marginBottom: 15 }]}>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: "#fff",
                      marginHorizontal: 15,
                    }}
                    source={require("../assets/images/weatherImages/visibility.png")}
                  />
                  <Text style={[styles.hoursText, { fontSize: 24 }]}>
                    {current?.vis_km} km
                  </Text>
                </View>
                <Text style={styles.uvText}>Humidity</Text>
                <View style={[styles.hoursIcon, { marginBottom: 15 }]}>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: "#fff",
                      marginHorizontal: 15,
                    }}
                    source={require("../assets/images/weatherImages/humidity1.png")}
                  />
                  <Text style={[styles.hoursText, { fontSize: 24 }]}>
                    {current?.humidity}%
                  </Text>
                </View>
                <Text style={styles.uvText}>Wind</Text>
                <View style={[styles.hoursIcon, { marginBottom: 15 }]}>
                  <Image
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: "#fff",
                      marginHorizontal: 15,
                    }}
                    source={require("../assets/images/weatherImages/air.png")}
                  />
                  <Text style={[styles.hoursText, { fontSize: 24 }]}>
                    {current?.wind_mph}mph
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* <View style={styles.indoorBox}>
            <Text style={[styles.airText, {marginBottom: 10}]}>
              SUN AND MOON
            </Text>
            <View style={styles.sunMoonDirection}>
              <View style={styles.sunriseView}>
                <Text style={styles.sunTime}>{sunRiseTime}</Text>
                <Text style={styles.sunText}>sunrise</Text>
              </View>
              <View style={styles.circleView}>
                <View style={styles.arc} />
                <Animated.View
                  style={[styles.sunView, {transform: [{rotate: tempDeg}]}]}>
                  <Image
                    style={styles.sun}
                    source={require('../assets/images/weatherImages/sun.png')}
                  />
                </Animated.View>
                <View style={styles.greenView}>
                  <View style={styles.greennFillView}>
                    <Animated.View
                      style={[styles.greenFill, {height: tempHeight}]}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.sunsetView}>
                <Text style={styles.sunTime}>{sunSetTime}</Text>
                <Text style={styles.sunText}>sunset</Text>
              </View>
            </View>
          </View> */}

          {/* <View style={styles.indoorBox}>
            <Text style={[styles.airText, {marginBottom: 10}]}>
              Allergy Outlook
            </Text>
            <View style={styles.outLookDirection}>
              <Text style={styles.outlookText}>Grass Pollen</Text>
              <Text style={styles.outlookText}>Low</Text>
            </View>
            <View style={styles.outLookDirection}>
              <Text style={styles.outlookText}>Mold</Text>
              <Text style={styles.outlookText}>Low</Text>
            </View>
            <View style={styles.outLookDirection}>
              <Text style={styles.outlookText}>Ragweed Pollen</Text>
              <Text style={styles.outlookText}>Low</Text>
            </View>
            <View style={styles.outLookDirection}>
              <Text style={styles.outlookText}>Tree Pollen</Text>
              <Text style={styles.outlookText}>Low</Text>
            </View>
          </View> */}
        </ScrollView>
      </View>
    </View>
  );
};
export default HomeScreen;

const styles = StyleSheet.create({
  airConditionViewBar: {
    alignItems: "center",
    justifyContent: "centers",
  },
  borderBottom: {
    borderColor: "#cce9e0",
    width: "160%",
    borderWidth: 2,
    alignSelf: "center",
    bottom: 20,
    position: "absolute",
  },
  greenFill: {
    backgroundColor: "#86b5df",
    width: 200,
    bottom: 0,
    position: "absolute",
  },
  greennFillView: {
    transform: [{ rotate: "90deg" }],
    width: 84,
    height: 175,
    borderTopLeftRadius: 90,
    borderBottomLeftRadius: 90,
    overflow: "hidden",
  },
  greenView: {
    alignItems: "center",
    position: "absolute",
    bottom: -25,
    alignSelf: "center",
  },
  sun: {
    marginLeft: -21,
    marginTop: -9.5,
    zIndex: 1,
    backgroundColor: "transparent",
    height: 20,
    width: 20,
    position: "absolute",
    borderRadius: 20,
  },
  sunView: {
    borderWidth: 2,
    borderColor: "transparent",
    zIndex: 1,
    width: 160,
    alignSelf: "center",
    position: "absolute",
    bottom: 22,
  },
  arc: {
    width: 180,
    height: 90,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#fff",
    alignSelf: "center",
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    bottom: 10,
  },
  inputView: {
    width: windowWidth * 0.9,
    backgroundColor: "white",
    borderRadius: 13,
    alignItems: "center",
    marginTop: "4%",
    position: "absolute",
    zIndex: 1,
    alignSelf: "center",
  },
  sunMoonDirection: {
    flexDirection: "row",
    alignSelf: "center",
  },
  sunriseView: {
    width: windowWidth * 0.19,
    alignItems: "center",
    justifyContent: "center",
  },
  sunsetView: {
    width: windowWidth * 0.19,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 13,
  },
  circleView: {
    width: windowWidth * 0.42,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    padding: 10,

    // height: (30),
  },
  sunTime: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    // padding: 10,
  },
  sunText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "300",
    padding: 10,
  },
  centerText: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  progressText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  capTextContainer: {
    width: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  capText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  outlookText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  outLookDirection: {
    width: windowWidth * 0.8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    alignSelf: "center",
  },
  uvText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 20,
  },
  line: {
    width: windowWidth * 0.8,
    height: 1,
    backgroundColor: "#fff",
    alignSelf: "center",
    borderRadius: 10,
  },
  airConditionView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  circleBarView: {
    width: windowWidth * 0.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  lineBarView: {
    width: windowWidth * 0.4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTextView: {
    width: windowWidth * 0.4,
  },
  airText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    margin: 15,
  },
  outdoorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  degree: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  dayView: {
    width: windowWidth * 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  temperatureView: {
    flexDirection: "row",
    width: windowWidth * 0.65,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  backgroundImage: {
    width: windowWidth,
    height: windowHeight,
    position: "absolute",
  },
  overlay: {
    flex: 1,
    position: "absolute",
    width: windowWidth,
    height: windowHeight,
  },
  header: {
    marginTop: "6%",
    alignItems: "center",
  },
  drawerIconView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    width: windowWidth,
  },
  iconView: {
    width: windowWidth * 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  searchView: {
    width: windowWidth * 0.6,
    justifyContent: "center",
    flexDirection: "row",
  },
  thirdView: {
    width: windowWidth * 0.15,
  },
  searchText: {
    fontSize: 20,
    color: "#fff",
  },
  timeText: {
    color: "#fff",
    fontSize: 15,
    alignSelf: "center",
  },
  scrollViewContent: {
    width: windowWidth * 0.93,
    alignSelf: "center",
  },
  indoorText: {
    color: "#fff",
    fontSize: 16,
    margin: 10,
    fontWeight: "600",
  },
  indoorBox: {
    width: windowWidth * 0.9,
    backgroundColor: "#64b5f6" + "100",
    borderWidth: 1.14,
    borderRadius: 17,
    alignSelf: "center",
    marginVertical: 10,
    borderColor: "#fff",
  },
  indoorDirection: {
    width: windowWidth * 0.7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  indoorTemp: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 20,
  },
  sunnyText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 15,
    color: "#fff",
  },
  iconViews: {
    alignItems: "center",
    justifyContent: "center",
  },
  hoursView: {
    width: windowWidth * 0.9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    alignSelf: "center",
    paddingHorizontal: windowWidth * 0.02,
  },
  hoursText: {
    fontSize: 15,
    color: "#fff",
  },
  hoursIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardBox: {
    width: 70,
    height: 155,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#64b5f6" + "20",
    borderRadius: 20,
    marginVertical: 10,
    padding: 10,
    alignSelf: "center",
    marginHorizontal: 10,
    borderWidth: 1.14,
    borderColor: "#fff",
  },
  degreeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: "cover", // Adjust as needed
  },
  horizontalScrollView: {
    width: windowWidth * 0.9,
    marginTop: 10,
    margin: 10,
  },

  searchTextView: {
    width: windowWidth * 0.9,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    position: "absolute",
    alignSelf: "center",
    top: windowHeight * 0.1,
    zIndex: 1,
  },
  direction: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  boldText: { fontWeight: "bold", fontSize: 30, color: "#fff" },
  simpleText: { color: "#fff", fontSize: 15 },
  textView: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  imageView: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
  temp: { color: "#fff", fontSize: 50, fontWeight: "bold" },
  partlyText: {
    color: "#fff",
    fontSize: 16,
  },
  directionView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: windowWidth * 0.9,
    alignSelf: "center",
    marginVertical: 20,
  },
  calenderView: {
    width: windowWidth * 0.9,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  windIcon: {
    width: 20,
    height: 20,
  },
  windText: {
    color: "#fff",
    marginLeft: 5,
  },
  cardView: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 88,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "space-evenly",
    marginHorizontal: 15,
    margin: 20,
  },
  cardImage: {
    width: 30,
    height: 30,
    margin: 7,
  },
  cardText: {
    color: "#fff",
    fontSize: 20,
    margin: 5,
    fontWeight: "bold",
  },
  cardTextDay: {
    color: "#fff",
    fontSize: 12,
    margin: 5,
  },
});
