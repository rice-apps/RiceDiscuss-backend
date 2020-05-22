import jwt from 'jsonwebtoken';
import request from 'request';
import { parseString } from 'xml2js';
import { processors } from 'xml2js';

import { User } from '../models';
import { CLIENT_TOKEN_SECRET } from '../config';

/* Routing for the homepage. Front end sends a get request to the backend and here is the 
 * handling for that get request.
 */

function oAuth(req, res) {
	const ticket = req.query.ticket;
	const d = new Date();

	if (ticket) {
		const casValidateURL = 'https://idp.rice.edu/idp/profile/cas/serviceValidate';
		// This should be the URL that we redirect the user back to after successful CAS authentication
		const serviceURL = 'http://localhost:3000/login'; // Using local host for testing purposes

		const url = `${casValidateURL}?ticket=${ticket}&service=${serviceURL}`;

		request(url, function (err, _, body) {

			if (err) return res.status(500);

			/* Parsing the XML body returned from CAS authentication */
			parseString(body, { tagNameProcessors: [processors.stripPrefix], explicitArray: false }, function (err, result) {

				if (err) {
					return res.status(500);
				}

				const serviceResponse = result.serviceResponse;
				const authSuccess = serviceResponse.authenticationSuccess;

				if (authSuccess) {
					const token = jwt.sign({ data: authSuccess }, CLIENT_TOKEN_SECRET);
					var newUserCheck = null;

					// Make netID lowercase to help avoid duplicate accounts
					authSuccess.user = authSuccess.user.toLowerCase();

					// Try to find the user in our database
					User.findOne({ username: authSuccess.user }, function (err, user) {
						if (err) {
							return res.status(500).send('Internal Error');
						}
						var userID = null;
						var netID = null;

						if (!user) {
							// Create a new user
							User.create({
								netID: authSuccess.user,
								username: authSuccess.user,
								token: token,
							}, function (err, newUser) {
								if (err) {
									return res.status(500).send();
								}

								newUserCheck = true;
								userID = newUser._id;
							});

						} else {
							// Existing user -- just need to send token to front end
							newUserCheck = false;
							userID = user._id;
							netID = user.username;
						}

						res.json({
							success: true,
							message: 'CAS authentication successful',
							isNewUser: newUserCheck,
							user: {
								_id: userID,
								netID: netID,
								token: token,
							},
						});
						return res.status(200);
					});
				} else if (serviceResponse.authenticationFailure) {
					return res.status(401).json({ success: false, message: 'CAS authentication failed' });
				} else {
					return res.status(500).send();
				}
			})
		})
	} else {
		return res.status(400);
	}
}

export default oAuth;
