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

app.get('/about-us', (req, res) => {
  res.send('this is the about us webpage');
});
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

function Location(city, rawLocationData) {
  this.rawDataSearchQuery = city;
  this.formattedSearchQuery = rawLocationData[0].display_name;
  this.latitude = rawLocationData[0].lat;
  this.longitude = rawLocationData[0].lon;
}




app.get('/location', handleLocation);

app.listen(PORT, () => {
  console.log(`server up on port ${PORT}`);
});
