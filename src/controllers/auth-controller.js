import express from 'express';
var router = express.Router();
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import request from 'request';
var xmlParser = require('xml2js').parseString;
var stripPrefix = require('xml2js').processors.stripPrefix;

var config = require('../config');

var User = require('../model/schema/User');

router.use(bodyParser.json());

/* Routing for the homepage. Front end sends a get request to the backend and here is the 
 * handling for that get request.
 */
router.get('/', function (req, res) {
	var ticket = req.query.ticket;
	//console.log("HERE", req.query);

	if (ticket){
		var casValidateURL = 'https://idp.rice.edu/idp/profile/cas/serviceValidate';
		// This should be the URL that we redirect the user back to after successful CAS authentication
		var serviceURL = 'http://localhost:3000/auth'; // Using local host for testing purposes

		var url = `${casValidateURL}?ticket=${ticket}?service=?${serviceURL}`;

		request(url, function (err, respose, body) {

			if (err) return res.status(500);

			/* Parsing the XML body returned from CAS authentication
			 */
			xmlParser(body, {tagNameProcessors: [stripPredix], explicitArray: false}, function (err, result) {

				if (err) return res.status(500);

				// global variable?
				serviceResponse = result.serviceResponse;

				var authSucess = serviceResponse.authenticationSuccess;
				//console.log('authSuccess: ', authSuccess);
				if (authSuccess) {
					//console.log('authentication succeeded!');

					var token = jwt.sign({data: authSuccess});

					var newUserCheck = null;

					// Make netID lowercase to help avoid duplicate accounts
					authSuccess.user = authSuccess.user.toLowerCase();

					// Try to find the user in our database
					User.findOne({username: authSuccess.user}, function (err, user) {
						if (err) return res.status(500).send('Internal Error');
						var userID = null;
						//console.log('user: ', user);

						if (!user) {
							// Create a new user
							User.create({
								netID: authSuccess.user,
								date_joined: Math.round((Date.getTime() / 1000))
							}, function (err, newUser) {
								if (err) return res.status(500).send();

								newUserCheck = true;
								userID = newUser._id;

								res.json({
									success: true,
									message: 'CAS authentication successful',
									isNewUser: newUserCheck,
									user: {
										_id: userID,
										token: token
									}
								});
								return res.status(200);
							});

						} else {
							// Existing user -- just need to send token to front end
							newUserCheck = false;
							userID = user._id;

							res.json({
								success: true,
								message: 'CAS authentication successful',
								isNewUser: newUserCheck,
								user : {
									_id: userID,
									token: token
								}
							});
							return res.status(200);
						}
					});
				} else if (serviceResponse.authenticationFailure) {
					return res.status(401).json({success: false, message: 'CAS authentication failed'});
				} else {
					return res.status(500).send();
				}
			})
		})
	} else {
		return res.status(400);
	}
});
