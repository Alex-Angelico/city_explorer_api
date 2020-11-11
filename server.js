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
  let city = req.query.city;
  let url = `https://api.weatherbit.io/v2.0/current?key=${WEATHER_API_KEY}&q=${city}&format=json&limit=1`;
  let weatherReports = {};

  if (weatherReports[url]) {
    res.send(weatherReports[url]);
  } else {
    superagent.get(url)
      .then(data => {
        const weatherData = data;
        Weather.all = weatherData.map(object => new Weather(object));
        locations[url] = Weather.all;
        res.json(weatherReportData);
      })
      .catch((error) => {
        console.error(error, 'did not work');
      })
  }
}

// function handleWeather(req, res) {
//   try {
//     let rawWeatherData = require('./data/weather.json');
//     // let city = `${req.query.city} 5 - day: `;
//     let array = rawWeatherData.data;
//    
//     // let weatherReport = `${ city } ${ Weather.all } `;
//     res.send(Weather.all);
//     // res.send(weatherReport);
//   } catch (error) {
//     console.error(error);
//   }
// }

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



app.use('*', (req, res) => {
  res.status(500).send('Sorry, something went wrong!');
})

app.listen(PORT, () => {
  console.log(`server up on port ${PORT} `);
});
