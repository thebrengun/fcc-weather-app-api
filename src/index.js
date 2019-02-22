import express from 'express';
import helmet from 'helmet';
import { handleCurrent, handleDaily, handleHourly } from './weather.js';
import { handleGeocode, handleReverseGeocode } from './maps.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const origin = process.env.ALLOW_ORIGIN;

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", process.env.NODE_ENV === 'development' || !origin ? '*' : origin);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/api/v1/weather/current', handleCurrent);
app.get('/api/v1/weather/daily', handleDaily);
app.get('/api/v1/weather/hourly', handleHourly);
app.get('/api/v1/geocode/encode', handleGeocode);
app.get('/api/v1/geocode/decode', handleReverseGeocode);

const server = app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

export default app;
