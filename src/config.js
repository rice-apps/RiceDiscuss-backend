import "dotenv/config";
import log from "loglevel";
import sanitizeHtml from "sanitize-html";

if (process.env.NODE_ENV === "development") {
    log.setLevel("trace");
}

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",");
const DEV_PORT = parseInt(process.env.DEV_PORT, 10);
const { MONGODB_CONNECTION_URL } = process.env;

const { CAS_VALIDATE_URL } = process.env;
const { CLIENT_TOKEN_SECRET } = process.env;
const { SERVICE_URL } = process.env;
const TOKEN_EXPIRE_TIME = parseInt(process.env.TOKEN_EXPIRE_TIME, 10);

const COLLEGES = process.env.COLLEGES.split(";");
const MAJORS = process.env.MAJORS.split(";");
const MINORS = process.env.MINORS.split(";");

const CHECK_HTML_CONFIG = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
        a: ["href"],
        img: ["src"],
    },
};

const MONGOOSE_CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
};

export {
    ALLOWED_ORIGINS,
    DEV_PORT,
    MONGODB_CONNECTION_URL,
    CAS_VALIDATE_URL,
    CLIENT_TOKEN_SECRET,
    SERVICE_URL,
    TOKEN_EXPIRE_TIME,
    COLLEGES,
    MAJORS,
    MINORS,
    CHECK_HTML_CONFIG,
    MONGOOSE_CONFIG,
};
