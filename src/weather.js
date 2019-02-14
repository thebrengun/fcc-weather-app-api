import fetch from 'isomorphic-fetch';

const defaultOptions = {lat: '40.7128', lon: '-74.0060'};
const APPID = process.env.OPEN_WEATHER_KEY;

if(!APPID) {
	throw new Error(`Expected environment variable 'OPEN_WEATHER_KEY' containing key for openweathermap.org API. 
		See https://openweathermap.org/appid to get a key.
	`);
}

function getCurrentWeather(options = defaultOptions) {
	options = {...options, APPID};
	const base = 'https://api.openweathermap.org/data/2.5/weather';
	const request = formatRequest(base, options);
	return fetch(request);
}

function getForecastWeather(options = defaultOptions) {
	options = {...options, cnt: 8, APPID};
	const base = 'https://api.openweathermap.org/data/2.5/forecast/daily';
	const request = formatRequest(base, options);
	return fetch(request);
}

function getHourlyForecastWeather(options = defaultOptions) {
	options = {...options, cnt: 12, APPID};
	const base = 'https://api.openweathermap.org/data/2.5/forecast';
	const request = formatRequest(base, options);
	return fetch(request);
}

function formatRequest(base, options) {
	return base + Object.keys(options).reduce(function(s, k, i) {
		var prefix = i === 0 ? '?' : '&';
		return s + prefix + encodeURIComponent(k) + '=' + encodeURIComponent(options[k]);
	}, '');
}

export { getCurrentWeather, getForecastWeather, getHourlyForecastWeather };