import fetch from 'isomorphic-fetch';
import { getTimeZone } from './maps.js';

const HOURLY_FORECAST = 'HOURLY_FORECAST';
const DAILY_FORECAST = 'DAILY_FORECAST';
const CURRENT_FORECAST = 'CURRENT_FORECAST';

const defaultOptions = {lat: '40.7128', lon: '-74.0060'};
const APPID = process.env.OPEN_WEATHER_KEY;

if(!APPID) {
	throw new Error(`Expected environment variable 'OPEN_WEATHER_KEY' containing key for openweathermap.org API. 
		See https://openweathermap.org/appid to get a key.
	`);
}

const handleCurrent = handleWeather(CURRENT_FORECAST);
const handleDaily = handleWeather(DAILY_FORECAST);
const handleHourly = handleWeather(HOURLY_FORECAST);

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
	let hourlyForecastJSON;
	let hourlyForecastStatus;
	return fetch(request).then(
		(response) => {
			hourlyForecastStatus = response.status;
			return response.json();
		}
	).then(
		(json) => {
			hourlyForecastJSON = json;
			return getTimeZone(options.lat, options.lon, json.list[0].dt);
		}
	).then(
		(response) => response.json
	).then(
		(timezoneJSON) => {
			const { dstOffset, rawOffset } = timezoneJSON;
			return parseInt(dstOffset, 10) + parseInt(rawOffset, 10);
		}
	).then(
		(offset) => {
			const adjustedList = hourlyForecastJSON.list.map((list, idx) => ({...list, localDt: parseInt(list.dt, 10) + offset}));
			return ({
				status: hourlyForecastStatus,
				json: function() {
					return {...hourlyForecastJSON, list: adjustedList}
				}
			});
		}
	);
}

function formatRequest(base, options) {
	return base + Object.keys(options).reduce(function(s, k, i) {
		var prefix = i === 0 ? '?' : '&';
		return s + prefix + encodeURIComponent(k) + '=' + encodeURIComponent(options[k]);
	}, '');
}

function getWeatherForecastFunc(mode) {
	switch(mode) {
		case DAILY_FORECAST:
			return getForecastWeather;
		case HOURLY_FORECAST:
			return getHourlyForecastWeather;
		case CURRENT_FORECAST:
		default:
			return getCurrentWeather;
	}
}

function handleWeather(mode = CURRENT_FORECAST) {
	const getWeather = getWeatherForecastFunc(mode);
	return (req, res) => {
		const {lat, lon, id} = req.query;
		const params = {};

		if(!id && lat && lon && (typeof lat !== 'string' || typeof lon !== 'string')) {
			return res.status(400).json({
				cod: 400,
				message: "Expected only one of each parameter 'lat' and 'lon'"
			});
		} else if(!id && lat && lon) {
			params['lat'] = encodeURIComponent(lat);
			params['lon'] = encodeURIComponent(lon);
		}

		if(id && typeof id !== 'string') {
			return res.status(400).json({
				cod: 400,
				message: "Expected a single id"
			});
		} else {
			params['id'] = encodeURIComponent(id);
		}

		getWeather(params).then(response => {
			res.status(response.status);
			return response.json();
		}).then(json => res.json(json));
	};
}

export { handleCurrent, handleDaily, handleHourly };