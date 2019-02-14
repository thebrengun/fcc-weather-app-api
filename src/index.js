import express from 'express';
import helmet from 'helmet';
import { 
	getCurrentWeather, 
	getForecastWeather, 
	getHourlyForecastWeather
 } from './weather.js';

const HOURLY_FORECAST = 'HOURLY_FORECAST';
const DAILY_FORECAST = 'DAILY_FORECAST';
const CURRENT_FORECAST = 'CURRENT_FORECAST';

const GAPI_KEY = process.env.GAPI_KEY;
if(!GAPI_KEY) {
	throw new Error(`Expected environment variable 'GAPI_KEY' containing key for Google Geocode API. 
		See https://developers.google.com/maps/documentation/geocoding/start to get a key.
	`);
}
const googleMapsClient = require('@google/maps').createClient({
	key: GAPI_KEY,
	Promise: Promise
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const origin = process.env.ALLOW_ORIGIN;

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", process.env.NODE_ENV === 'development' || !origin ? '*' : origin);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/api/v1/weather/current', handleWeather(CURRENT_FORECAST));
app.get('/api/v1/weather/daily', handleWeather(DAILY_FORECAST));
app.get('/api/v1/weather/hourly', handleWeather(HOURLY_FORECAST));
app.get('/api/v1/geocode/encode', (req, res) => {
	const address = req.query.address;
	if(typeof address !== 'string') {
		return res.status(400).json({
			cod: 400,
			message: "Expected a single address parameter"
		});
	}

	googleMapsClient.geocode({
		address: encodeURIComponent(address)
	}).asPromise().then(
		response => {
			return response.json.results;
		}
	).catch(
		err => {
			res.status(res.statusCode || 400);
			return err.json;
		}
	).then(
		json => {
			res.status(res.statusCode || 200);
			res.json({cod: res.statusCode, message: json.error_message || '', ...json});
		}
	);
});

app.get('/api/v1/geocode/decode', (req, res) => {
	const lat = encodeURIComponent(req.query.lat);
	const lon = encodeURIComponent(req.query.lon);

	if(typeof lat !== 'string' || typeof lon !== 'string') {
		return res.status(400).json({
			cod: 400,
			message: "Expected one of each parameter 'lat' and 'lon'"
		});
	}

	googleMapsClient.reverseGeocode({
		latlng: `${lat},${lon}`
	}).asPromise().then(
		response => {
			return response.json.results;
		}
	).catch(
		err => {
			res.status(res.statusCode || 400);
			return err.json;
		}
	).then(
		json => {
			res.status(res.statusCode || 200);
			res.json({cod: res.statusCode, message: json.error_message || '', ...json});
		}
	);
});

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

const server = app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

export default app;