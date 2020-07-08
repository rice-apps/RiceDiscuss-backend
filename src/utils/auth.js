import bent from "bent";
import jwt from "jsonwebtoken";
import log from "loglevel";
import { Parser, processors } from "xml2js";

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

async function checkWithCAS(ticket) {
    const url = `${CAS_VALIDATE_URL}?ticket=${ticket}&service=${SERVICE_URL}`;

    const rawXML = await get(url);

    return casParser
        .parseStringPromise(rawXML)
        .then((xml) => {
            if (xml.serviceResponse.authenticationSuccess) {
                return {
                    success: true,
                    netID: xml.serviceResponse.authenticationSuccess.user,
                };
            }
            return {
                success: false,
                netID: null,
            };
        })
        .catch((err) => {
            log.error(err);
            return {
                success: false,
                netID: null,
            };
        });
}

function createToken(user) {
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

function isTokenExpired(user) {
    try {
        jwt.verify(user.token, CLIENT_TOKEN_SECRET);

        return false;
    } catch (err) {
        return true;
    }
}

export { checkWithCAS, createToken, isTokenExpired };
