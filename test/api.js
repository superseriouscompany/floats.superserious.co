const request = require('request-promise');
const config  = require('../services/config');
const baseUrl = process.env.NODE_ENV == 'production' ? config.baseUrl : 'http://localhost:3000/v1';

const defaults = {
  baseUrl: baseUrl,
  json: true,
  resolveWithFullResponse: true
}

module.exports = request.defaults(defaults);

module.exports.authenticated = function(accessToken) {
  return request.defaults(Object.assign(defaults, {
    headers: { 'X-Access-Token': accessToken }
  }));
}

module.exports.baseUrl = baseUrl;
