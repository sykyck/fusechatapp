var router = require('express');
var ApiController = require('./api.controller');
var approuter = new router();

// logout call from casplayer side
approuter.route('/logout').post(ApiController);

module.exports = approuter;
