var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var request = require('request');
var xmlParser = require('xml2js').parseString;
var stripPrefix = require('xml2js').processors.stripPrefix;

var config = require('../scr/config');

var User = require('../src/model/chema/User');

router.use(bodyParser.json());

router.get('/', function (req, res) {
	var ticket = req.query.ticket;
	var casValidateURL = 'https://idp.rice.edu/idp/profile/cas/serviceValidate';

	if (ticket){
		var url = casValidateURL;
	}
})