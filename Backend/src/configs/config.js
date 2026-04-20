import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in the environment variables.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in the environment variables.");
  process.exit(1);
}

const CLIENT_ID = process.env.CLIENT_ID;
if (!CLIENT_ID) {
  console.error("CLIENT_ID is not defined in the environment variables.");
  process.exit(1);
}

const CLIENT_SECRET = process.env.CLIENT_SECRET;
if (!CLIENT_SECRET) {
  console.error("CLIENT_SECRET is not defined in the environment variables.");
  process.exit(1);
}

const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
if (!REFRESH_TOKEN) {
  console.error("REFRESH_TOKEN is not defined in the environment variables.");
  process.exit(1);
}

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error("ACCESS_TOKEN is not defined in the environment variables.");
  process.exit(1);
}

const GOOGLE_ID = process.env.GOOGLE_ID;
if (!GOOGLE_ID) {
  console.error("GOOGLE_ID is not defined in the environment variables.");
  process.exit(1);
}

export default {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  ACCESS_TOKEN,
  GOOGLE_ID
};