'use strict';

require('dotenv').config();

// 3rd party dependencies
const express = require('express');
const cors = require('cors');

// application constants
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.static('./public'));


function handleLocation(req, res) {
  try {
    let rawLocationData = require('./data/location.json');
    let city = req.query.city;
    let locationData = new Location(city, rawLocationData);
    res.send(locationData);
  } catch(error){
    console.error(error);
  }
}
function handleWeather(req, res) {
  try {
    let rawWeatherData = require('./data/weather.json');
    let city = req.query.city;
    let weatherData = new Weather(city, rawWeatherData);
    res.send(weatherData);
  } catch(error){
    console.error(error);
  }
}

function Location(city, rawLocationData) {
  this.rawDataSearchQuery = city;
  this.formattedSearchQuery = rawLocationData[0].display_name;
  this.latitude = rawLocationData[0].lat;
  this.longitude = rawLocationData[0].lon;
}

function Weather(city, rawWeatherData) {
  let array = rawWeatherData.data;
  let formattedWeatherData = [];
  array.forEach(object => {
    this.dataHolder = [];
    this.rawDataSearchQuery = city;
    this.formattedSearchQuery = object.city_name;
    this.forecast = dataHolder.push(object.weather.description);
    this.time = dataHolder.push(object.datetime);
    formattedWeatherData.push(dataHolder);

  })
  
}

app.get('/location', handleLocation);
app.get('/weather', handleWeather);

app.listen(PORT, () => {
  console.log(`server up on port ${PORT}`);
});
