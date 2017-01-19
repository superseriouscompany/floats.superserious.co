const request = require('request-promise');
const config  = require('../config');
const baseUrl = process.env.NODE_ENV == 'production' ? config.baseUrl : 'http://localhost:4200/v1';

const api = request.defaults({
  baseUrl: baseUrl,
  json: true,
  resolveWithFullResponse: true
});

api.authenticated = function(accessToken) {
  return api.defaults({
    headers: { 'X-Access-Token': accessToken }
  });
}

api.baseUrl = baseUrl;
module.exports = api;
