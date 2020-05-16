import jwt from 'jsonwebtoken';
import request from 'request';
var xmlParser = require('xml2js').parseString;
const stripPrefix = require('xml2js').processors.stripPrefix;
var config = require('../config');
import Models from '../model';
import mongoose from 'mongoose';

/* Routing for the homepage. Front end sends a get request to the backend and here is the 
 * handling for that get request.
 */
function oAuth(req, res) {
	var ticket = req.params.ticket;
	var d = new Date();

	console.log(ticket);

	if (ticket) {
		var casValidateURL = 'https://idp.rice.edu/idp/profile/cas/serviceValidate';
		// This should be the URL that we redirect the user back to after successful CAS authentication
		var serviceURL = 'http://localhost:3000'; // Using local host for testing purposes

		var url = `${casValidateURL}?ticket=${ticket}&service=${serviceURL}`;
		var serviceResponse;

		request(url, function (err, response, body) {

			if (err) return res.status(500);

			/* Parsing the XML body returned from CAS authentication */
			xmlParser(body, { tagNameProcessors: [stripPrefix], explicitArray: false }, function (err, result) {

				if (err) 
					return res.status(500);

				serviceResponse = result.serviceResponse;
				var authSuccess = serviceResponse.authenticationSuccess;

				if (authSuccess) {

					var token = jwt.sign({ data: authSuccess }, "config.secret");
					var newUserCheck = null;

					// Make netID lowercase to help avoid duplicate accounts
					authSuccess.user = authSuccess.user.toLowerCase();

					// Try to find the user in our database
					Models.User.findOne({ username: authSuccess.user }, function (err, user) {
						if (err)
						{
							console.log("Line 60");
							return res.status(500).send('Internal Error');
						}
						var userID = null;

						if (!user) {
							// Create a new user
							Models.User.create({
								_id: mongoose.Types.ObjectId(),
								netID: authSuccess.user,
								username: authSuccess.user,
								date_joined: Math.round((d.getTime() / 1000))
							}, function (err, newUser) {
								if (err)
								{
									console.log("Line 74");
									console.log(err);
									console.log(newUser);
									return res.status(500).send();
								}
									
								newUserCheck = true;
								userID = newUser._id;
							});

						} else {
							// Existing user -- just need to send token to front end
							newUserCheck = false;
							userID = user._id;
						}

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
				} else if (serviceResponse.authenticationFailure) {
					return res.status(401).json({ success: false, message: 'CAS authentication failed' });
				} else {
					console.log("Line 113");
					return res.status(500).send();
				}
			})
		})
	} else {
		return res.status(400);
	}
}

module.exports = (app) => {
	app.use('/login/:ticket', oAuth)
}
