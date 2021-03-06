# Free Code Camp Weather App API

This repository provides access to the [Open Weather API](https://openweathermap.org/api) and to the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro). In tandem, these APIs make it possible to provide location specific weather data from Open Weather based on latitude and longitude coordinates derived from an address string provided to Google Maps Geocode by the user.

## Getting Started
You must have API keys for both Open Weather and Google Maps.
- [Open Weather Getting Started](https://openweathermap.org/appid)
- [Google Maps Geocode Getting Started](https://developers.google.com/maps/documentation/geocoding/start)

The keys are accessed via environment variables. You can set up a .env.local file in the root and set keys like this:

```
OPEN_WEATHER_KEY=YOUR_KEY_HERE
GAPI_KEY=YOUR_KEY_HERE
```

You can also pass in a value to set the Access-Control-Allow-Origin header by setting a key: `ALLOW_ORIGIN=https://my-allowed-origin`

# API

All responses contain `cod`, the response status code, and `message` explaining the code. All other keys are spread from the upstream response.

```
{
  cod: <status_code>,
  message: <status_message>,
  ...<open_weather_response_json>|...<google_api_response_json>
}
```

## Current Weather

### /api/v1/weather/current (GET)
#### Parameters
**lat=[float]&lon=[float] id=[string]**
Either an id or latitude and longitude are required and the only parameters supported at this time.

View the Open Weather [documentation](https://openweathermap.org/current/#geo)

#### Notes

Support for language parameter should be added in the future.

## Forecast Weather

### /api/v1/weather/daily (GET)
#### Parameters
**lat=[float]&lon=[float] id=[string]**
Either an id or latitude and longitude are required and the only parameters supported at this time. This returns an 8 day daily forecast.

View the Open Weather [documentation](https://openweathermap.org/forecast16/#geo16)

#### Notes

Support for language parameter should be added in the future. Currently the forecast for 8 days is returned by default and no parameter to extend to the total possible 16 days exists. Probably this should be added.

This also returns a localDt in addition to the dt. This is to provide support for local timezone information and is obtained by submitting the first dt from the Google Maps Time Zone API. Of course, if during the forecast period daylight savings time becomes in or out of effect some of the times will be 1 hour off. But this is preferable to making multiple requests to the Time Zone API for an edge case that only occurs twice a year (and only in some localities) and that ultimately is of little significance to users.

## 3 Hour Forecast

### /api/v1/weather/hourly (GET)
#### Parameters
**lat=[float]&lon=[float] id=[string]**
Either an id or latitude and longitude are required and the only parameters supported at this time. This returns an 12 forecasts spaced out by 3 hours.

View the Open Weather [documentation](https://openweathermap.org/forecast5)

#### Notes

Support for language parameter should be added in the future. Currently the forecast for 36 hours is returned by default and no parameter to extend to the total possible 5 days exists. Probably this should be added.

## Geocode

### /api/v1/geocode/decode (GET)
#### Parameters
**lat=[float]&lon=[float]**
Latitude and longitude are required and the only parameters supported at this time.

View the Google Maps [documentation](https://developers.google.com/maps/documentation/geocoding/start#reverse)

## Reverse Geocode

### /api/v1/geocode/encode (GET)
#### Parameters
**address=[string]**
A query address string to find the latitude and longitude of.

View the Google Maps [documentation](https://developers.google.com/maps/documentation/geocoding/start)
