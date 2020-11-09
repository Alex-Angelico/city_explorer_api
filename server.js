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

app.get('/about-us', (request, response) => {
  response.send('this is the about us webpage');
});

app.listen(PORT, () => {
  console.log(`server up on port ${PORT}`);
});
