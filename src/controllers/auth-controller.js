import bent from "bent";
import jwt from "jsonwebtoken";
import { Parser, processors } from "xml2js";

import { User } from "../models";
import pubsub from "../pubsub";

import {
    CAS_VALIDATE_URL,
    CLIENT_TOKEN_SECRET,
    SERVICE_URL,
    TOKEN_EXPIRE_TIME,
} from "../config";

const get = bent("GET", "string");

const casParser = new Parser({
    tagNameProcessors: [processors.stripPrefix],
    explicitArray: false,
});

async function verifyTicket(request, response) {
    const ticket = request.body.ticket;

    let status = 400;
    const payload = {
        success: false,
    };

    if (ticket) {
        status = 500;

        const url = `${CAS_VALIDATE_URL}?ticket=${ticket}&service=${SERVICE_URL}`;

        const rawXML = await get(url).catch(() => null);

        if (rawXML) {
            const result = await casParser
                .parseStringPromise(rawXML)
                .catch(() => null);

            if (result) {
                status = 401;

                if (result.serviceResponse.authenticationSuccess) {
                    status = 500;

                    const cas = result.serviceResponse.authenticationSuccess;

                    payload.isNewUser = !await User.exists({ netID: cas.user });

                    if (payload.isNewUser) {
                        payload.user = await createNewUserFromCAS(cas);

                        if (payload.user) {
                            status = 200;
                            payload.success = true;
                        }
                    } else {
                        const user = await User.findOne({ netID: cas.user });
                        payload.user = await tryTokenReissue(user);

                        if (payload.user) {
                            status = 200;
                            payload.success = true;
                        }
                    }
                }
            }
        }
    }

    return response.status(status).send(payload);
}

async function createNewUserFromCAS(casRes) {
    let res = null;
    let saved = null;

    const newUser = await User.create({
        netID: casRes.user,
        username: casRes.user,
    }).catch(() => null);

    if (newUser) {
        await pubsub.publish("profileCreated", {
            profileCreated: {
                _id: newUser._id,
                netID: newUser.netID,
            },
        });

        newUser.token = createTokenFromUser(newUser);
        saved = await newUser.save().catch(() => null);

        if (saved) {
            res = {
                _id: newUser._id,
                netID: newUser.netID,
                token: newUser.token,
            };
        }
    }

    return res;
}

async function tryTokenReissue(user) {
    try {
        jwt.verify(user.token, CLIENT_TOKEN_SECRET);

        return {
            _id: user._id,
            netID: user.netID,
            token: user.token,
        };
    } catch (err) {
        user.token = createTokenFromUser(user);

        success = await user
            .save()
            .then(() => true)
            .catch(() => false);

        if (success) {
            return {
                _id: user._id,
                netID: user.netID,
                token: user.token,
            };
        } else {
            return null;
        }
    }
}

function createTokenFromUser(user) {
    return jwt.sign(
        {
            _id: user._id,
            netID: user.netID,
        },
        CLIENT_TOKEN_SECRET,
        {
            expiresIn: TOKEN_EXPIRE_TIME,
        },
    );
}

export { verifyTicket };
