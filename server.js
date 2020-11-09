'use strict';

require('dotenv').config();


const express = require('express');
const cors = require('cors');

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
    let array = rawWeatherData.data;
    Weather.all = [];
    array.forEach(object => {
      Weather.all.push(new Weather(object));
    })
    res.send(Weather.all);
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

function Weather(object) {
    this.forecast = object.weather.description;
    this.time = object.datetime;
}

app.get('/location', handleLocation);
app.get('/weather', handleWeather);

app.use('*', (req, res) => {
	res.status(500).send('Sorry, something went wrong!');
})

app.listen(PORT, () => {
  console.log(`server up on port ${PORT}`);
});
