import axios from 'axios';
import {API_KEY} from '../constants/index';

const ForcastEndPoint = params =>
  `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params?.cityName}&${params?.days}=1&aqi=no&alerts=no`;
const LocationEndPoint = params =>
  `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params?.cityName}`;

const ApiCall = async endpoint => {
  const options = {
    method: 'GET',
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    console.log('response', response.data);
    return response.data;
  } catch (err) {
    console.log('error', err);
    return null;
  }
};

export const FetchWeatherForcast = async params => {
  console.log('FetchWeatherForcastparams', params);
  const forcastUrl = await ForcastEndPoint(params);
  console.log('FetchWeatherForcastforcastUrl', forcastUrl);
  return ApiCall(forcastUrl);
};

export const FetchWeatherLocation = async params => {
  const locationUrl = await LocationEndPoint(params);
  return ApiCall(locationUrl);
};
