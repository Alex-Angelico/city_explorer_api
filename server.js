'use strict';

const express = require('express');
const superagent = require('superagent');
const dotenv = require('dotenv');
const cors = require('cors');
const pg = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.static('./public'));

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleRestaurants);

function handleLocation(req, res) {
  let city = req.query.city;
  let dbVerify = `SELECT * FROM locations WHERE search_query = '${city}';`;

  client.query(dbVerify)
    .then(data => {
      if (data.rows.length > 0) {
        res.json(data.rows[0]);
      } else {
        let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
        superagent.get(url)
          .then(data => {
            const geoData = data.body[0];
            const locationData = new Location(city, geoData);
            let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *;';
            let values = [city, geoData.display_name, geoData.lat, geoData.lon];
            client.query(SQL, values)
              .then(() => {
                res.json(locationData);
              })
          })
          .catch((error) => {
            console.error(error, 'did not work');
          })
      }
    })
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

function handleTrails(req, res) {
  let lat = req.query.latitude;
  let lon = req.query.longitude;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${TRAIL_API_KEY}&format=json`;
  let trails = {};

  if (trails[url]) {
    res.send(trails[url]);
  } else {
    superagent.get(url)
      .then(trails => {
        const trailData = trails.body;
        Trail.all = trailData.trails.map(object => new Trail(object));
        trails[url] = Trail.all;
        res.json(Trail.all);
      })
      .catch((error) => {
        console.error(error, 'did not work');
      })
  }
}

function handleMovies(req, res) {
  let city = req.query.search_query;
  let url = `https://api.themoviedb.org/3/search/movie/?api_key=${MOVIE_API_KEY}&query=${city}`;
  let movies = {};

  if (movies[url]) {
    res.send(movies[url]);
  } else {
    superagent.get(url)
      .then(movies => {
        const movieData = movies.body.results;
        Movie.all = movieData.map(object => new Movie(object));
        movies[url] = Movie.all;
        res.json(Movie.all);
      })
      .catch((error) => {
        console.error(error, 'did not work');
      })
  }
}

function handleRestaurants(req, res) {
  let lat = req.query.latitude;
  let lon = req.query.longitude;
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}`;
  superagent.get(url)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(restaurants => {
      const restaurantData = restaurants.body.businesses;
      Restaurant.all = restaurantData.map(object => new Restaurant(object));
      restaurants[url] = Restaurant.all;
      res.json(Restaurant.all);
    })
    .catch((error) => {
      console.error(error, 'did not work');
    })
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

function Trail(object) {
  this.name = object.name;
  this.location = object.location;
  this.length = object.length;
  this.stars = object.stars;
  this.star_votes = object.star_votes;
  this.summary = object.summary;
  this.trail_url = object.trail_url;
  this.conditions = object.conditions;
  this.condition_date = object.condition_date;
  this.condition_time = object.condition_time;
}

function Movie(object) {
  this.title = object.title;
  this.overview = object.overview;
  this.average_votes = object.average_votes;
  this.total_votes = object.total_votes;
  this.image_url = `https://image.tmdb.org/t/p/w500${object.poster_path}`;
  this.popularity = object.popularity;
  this.released_on = object.released_on;
}

function Restaurant(object) {
  this.name = object.name;
  this.image_url = object.image_url;
  this.price = object.price;
  this.rating = object.rating;
  this.url = object.url;
}

app.use('*', handleNotFound)
function handleNotFound(req, res) {
  res.status(500).send('Sorry, something went wrong!');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server up!  ${PORT}`);
    });
  })
  .catch(err => console.log(err));
