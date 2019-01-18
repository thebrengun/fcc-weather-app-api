import express from 'express';
import helmet from 'helmet';
import { getCurrentWeather, getForecastWeather } from './weather.js';

const googleMapsClient = require('@google/maps').createClient({
	key: process.env.GAPI_KEY,
	Promise: Promise
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use((req, res, next) => {
	let origin = process.env.NODE_ENV === 'development' ? '*' : 'https://thebrengun.github.io';
	res.header("Access-Control-Allow-Origin", origin);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/api/v1/weather/current', handleWeather());
app.get('/api/v1/weather/daily', handleWeather(false));
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

function handleWeather(current = true) {
	const getWeather = current ? getCurrentWeather : getForecastWeather;
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