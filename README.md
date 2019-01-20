# Free Code Camp Weather App API

This repository provides access to the [Open Weather API](https://openweathermap.org/api) and to the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro). In tandem, these APIs make it possible to provide location specific weather data from Open Weather based on latitude and longitude coordinates derived from an address string provided to Google Maps Geocode by the user.

## Getting Started
You must have API keys for both Open Weather and Google Maps.
[Open Weather Getting Started](https://openweathermap.org/appid)
[Google Maps Geocode Getting Started](https://developers.google.com/maps/documentation/geocoding/start)

The keys are accessed via environment variables. You can set up a .env.local file in the root and set keys like this:

OPEN_WEATHER_KEY=YOUR_KEY_HERE
GAPI_KEY=YOUR_KEY_HERE

You can also pass in a value to set the Access-Control-Allow-Origin header by setting a key:
ALLOW_ORIGIN=ALLOWED_ORIGIN

# API

## Current Weather

### /api/v1/weather/current (GET)
#### Parameters
**lat=[float]&lon=[float] id=[string]**
Either an id or latitude and longitude are required and the only parameters supported at this time.

View the Open Weather [documentation](https://openweathermap.org/current/#geo)

#### Response
cod: Status Code
message: A message
...Open Weather Response

#### Notes

Support for language parameter should be added in the future.

## Forecast Weather

### /api/v1/weather/daily (GET)
#### Parameters
**lat=[float]&lon=[float] id=[string]**
Either an id or latitude and longitude are required and the only parameters supported at this time. This returns an 8 day daily forecast.

View the Open Weather [documentation](https://openweathermap.org/forecast16/#geo16)

#### Response
cod: Status Code
message: A message
...Open Weather Response

#### Notes

Support for language parameter should be added in the future. Currently the forecast for 8 days is returned by default and no parameter to extend to the total possible 16 days exists. Probably this should be added.

## Geocode

### /api/v1/geocode/decode (GET)
#### Parameters
**lat=[float]&lon=[float]**
Latitude and longitude are required and the only parameters supported at this time.

View the Google Maps [documentation](https://developers.google.com/maps/documentation/geocoding/start#reverse)

#### Response
cod: Status Code
message: Alias of error_message
...Geocode API Response

#### Notes

## Reverse Geocode

### /api/v1/geocode/encode (GET)
#### Parameters
**address=[string]**
A query address string to find the latitude and longitude of.

View the Google Maps [documentation](https://developers.google.com/maps/documentation/geocoding/start)

#### Response
cod: Status Code
message: Alias of error_message
...Geocode API Response

#### Notes