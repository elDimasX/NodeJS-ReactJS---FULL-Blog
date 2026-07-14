const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const app = express();

// Usado para analisar métodos, como o GET/POST/JSON, isso precisa estar aqui
app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";

const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));


const MAX_SESSION_TIME = 1000 * 60 * 60 * 24 * 3; // 3 dias

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? "none" : "strict",
        maxAge: MAX_SESSION_TIME
    }
}));

module.exports = { app, sessionStore };