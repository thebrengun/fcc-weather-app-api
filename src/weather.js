import fetch from 'isomorphic-fetch';

const defaultOptions = {lat: '40.7128', lon: '-74.0060'};

function getCurrentWeather(options = defaultOptions) {
	options = {...options, APPID: process.env.OPEN_WEATHER_KEY};
	const base = 'https://api.openweathermap.org/data/2.5/weather';
	const request = formatRequest(base, options);
	return fetch(request);
}

function getForecastWeather(options = defaultOptions) {
	options = {...options, cnt: 8, APPID: process.env.OPEN_WEATHER_KEY};
	const base = 'https://api.openweathermap.org/data/2.5/forecast/daily';
	const request = formatRequest(base, options);
	return fetch(request);
}

function formatRequest(base, options) {
	return base + Object.keys(options).reduce(function(s, k, i) {
		var prefix = i === 0 ? '?' : '&';
		return s + prefix + encodeURIComponent(k) + '=' + encodeURIComponent(options[k]);
	}, '');
}

export { getCurrentWeather, getForecastWeather };