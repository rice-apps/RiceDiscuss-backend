var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var request = require('request');
var xmlParser = require('xml2js').parseString;
var stripPrefix = require('xml2js').processors.stripPrefix;

var config = require('../config');

var User = require('../model/schema/User');

router.use(bodyParser.json());

router.get('/', function (req, res) {
	var ticket = req.query.ticket;
	if (ticket){
		var casValidateURL = 'https://idp.rice.edu/idp/profile/cas/serviceValidate';
		// This should be the URL that we redirect the user back to after successful CAS authentication
		var serviceURL = 'http://localhost:3000/auth'; // Using local host for testing purposes
		
		var url = ${casValidateURL}?ticket=${ticket}?service=?{serviceURL};
	}
})
