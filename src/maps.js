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

function handleGeocode(req, res) {
	const address = req.query.address;
	if(typeof address !== 'string') {
		return res.status(400).json({
			cod: 400,
			message: "Expected a single address parameter"
		});
	}

	googleMapsClient.geocode({address: address}).asPromise()
		.then(
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
}

function handleReverseGeocode(req, res) {
	const lat = req.query.lat;
	const lon = req.query.lon;

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
}

function getTimeZone(lat, lon, timestamp) {
	return googleMapsClient.timezone({
		location: `${lat},${lon}`,
		timestamp
	}).asPromise();
}

export { getTimeZone, handleGeocode, handleReverseGeocode };