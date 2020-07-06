import "dotenv/config";
import sanitizeHtml from "sanitize-html";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",");
const DEV_PORT = parseInt(process.env.DEV_PORT);
const MONGODB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL;

const CAS_VALIDATE_URL = process.env.CAS_VALIDATE_URL;
const CLIENT_TOKEN_SECRET = process.env.CLIENT_TOKEN_SECRET;
const SERVICE_URL = process.env.SERVICE_URL;
const TOKEN_EXPIRE_TIME = parseInt(process.env.TOKEN_EXPIRE_TIME);

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
