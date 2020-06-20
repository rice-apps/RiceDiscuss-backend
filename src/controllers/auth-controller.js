import jwt from "jsonwebtoken";
import bent from "bent";
import { parseStringPromise } from "xml2js";
import { processors } from "xml2js";

import { User } from "../models";
import { CLIENT_TOKEN_SECRET, CAS_VALIDATE_URL, SERVICE_URL } from "../config";

const get = bent("GET", "string");

async function oAuth(request, response) {
    const ticket = request.body.ticket;

    if (ticket) {
        const url = `${CAS_VALIDATE_URL}?ticket=${ticket}&service=${SERVICE_URL}`;

        const rawXML = await get(url).catch(() => {
            return response.status(500).send();
        });

        const result = await parseCASResponseXML(rawXML).catch(() => {
            return response.status(500).send();
        });

        if (result.serviceResponse.authenticationSuccess) {
            const currentUser = await User.findOne({
                netID: result.serviceResponse.authenticationSuccess.user,
            });

            const isNewUser = currentUser == null;

            let userID;
            let netID;
            let token;

            if (isNewUser) {
                const newToken = jwt.sign(
                    {
                        data: result.serviceResponse.authenticationSuccess,
                    },
                    CLIENT_TOKEN_SECRET,
                    {
                        expiresIn: 60 * 60 * 24 * 7,
                    },
                );

                const newUser = await User.create({
                    netID: result.serviceResponse.authenticationSuccess.user,
                    username: result.serviceResponse.authenticationSuccess.user,
                    token: newToken,
                }).catch(() => {
                    return response.status(500).send();
                });
                userID = newUser._id;
                netID = newUser.netID;
                token = newToken;
            } else {
                try {
                    jwt.verify(currentUser.token, CLIENT_TOKEN_SECRET);
                } catch (err) {
                    currentUser.token = jwt.sign(
                        {
                            data: result.serviceResponse.authenticationSuccess,
                        },
                        CLIENT_TOKEN_SECRET,
                        {
                            expiresIn: 60 * 60 * 24 * 7,
                        },
                    );

                    await currentUser.save();
                }

                userID = currentUser._id;
                netID = currentUser.netID;
                token = currentUser.token;
            }

            return response.status(200).json({
                success: true,
                message: "CAS authentication succeeeded!",
                isNewUser: isNewUser,
                user: {
                    _id: userID,
                    netID: netID,
                    token: token,
                },
            });
        } else if (result.authenticationFailure) {
            return response.status(401).json({
                success: false,
                message: "CAS authentication failed!",
            });
        } else {
            return response.status(500).send();
        }
    } else {
        return response.status(400).send();
    }
}

async function parseCASResponseXML(casResponse) {
    return parseStringPromise(casResponse, {
        tagNameProcessors: [processors.stripPrefix],
        explicitArray: false,
    }).then((value) => {
        if (value.authenticationSuccess) {
            value.serviceResponse.authenticationSuccess.user = value.serviceResponse.authenticationSuccess.user.toLowerCase();
        }

        return value;
    });
}

export default oAuth;
