'use strict';

const express = require('express');
const app     = express();

const port    = process.env.PORT || 3000;

app.get('/', function(req, res) {
  res.json({cool: 'nice'});
})

app.listen(port, function(err) {
  if( err ) { throw err; }
  console.log(`Listening on ${port}`);
})
