import "dotenv/config";

const CLIENT_TOKEN_SECRET = process.env.CLIENT_TOKEN_SECRET;
const MONGODB_CONNECTION_URL = process.env.MONGODB_CONNECTION_URL;
const SERVICE_URL = process.env.SERVICE_URL;
const DEV_PORT = parseInt(process.env.DEV_PORT);
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",");

export {
    CLIENT_TOKEN_SECRET,
    MONGODB_CONNECTION_URL,
    SERVICE_URL,
    DEV_PORT,
    ALLOWED_ORIGINS,
};
