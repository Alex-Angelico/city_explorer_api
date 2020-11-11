'use strict';

const express = require('express');
const superagent = require('superagent');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

app.use(cors());
app.use(express.static('./public'));

app.get('/location', handleLocation);
app.get('/weather', handleWeather);

function handleLocation(req, res) {
  let city = req.query.city;
  let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
  let locations = {};

  if (locations[url]) {
    res.send(locations[url]);
  } else {
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const locationData = new Location(city, geoData);
        locations[url] = locationData;
        res.json(locationData);
      })
      .catch((error) => {
        console.error(error, 'did not work');
      })
  }
}

function handleWeather(req, res) {
  let lat = req.query.latitude;
  let lon = req.query.longitude;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${lat}&lon=${lon}&days=8&format=json`;
  let weatherReports = {};

  if (weatherReports[url]) {
    res.send(weatherReports[url]);
  } else {
    superagent.get(url)
      .then(data => {
        const weatherData = data.body;
        Weather.all = weatherData.data.map(object => new Weather(object));
        weatherReports[url] = Weather.all;
        res.json(Weather.all);
      })
      .catch((error) => {
        console.error(error, 'did not work');
      })
  }
}

function Location(city, rawLocationData) {
  this.search_query = city;
  this.formatted_query = rawLocationData.display_name;
  this.latitude = rawLocationData.lat;
  this.longitude = rawLocationData.lon;
}

function Weather(object) {
  this.forecast = object.weather.description;
  this.time = object.datetime;
}



app.use('*', handleNotFound) 
function handleNotFound(req, res) {
  res.status(500).send('Sorry, something went wrong!');
}

app.listen(PORT, () => {
  console.log(`server up on port ${PORT} `);
});
