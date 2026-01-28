const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();
const connectToDb = require('./db/db');
connectToDb();
app.use(cookieParser());
const passport = require('passport');
const googleAuth = require('./middlewares/googleAuth');
const googleStrategy = require('passport-google-oauth20').Strategy;
const userRoutes = require('./routes/UserRoutes');
const transactionRoutes = require('./routes/TransactionRoutes');
const accountRoutes = require('./routes/AccountRoutes');
const budgetRoutes = require('./routes/BudgetRoutes');
const goalRoutes = require('./routes/GoalRoutes');
const noteRoutes = require('./routes/NoteRoutes');
const billRoutes = require('./routes/BillRoutes');
const notificationRoutes = require('./routes/NotificationRoutes');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize'); 

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //     secure: process.env.NODE_ENV === 'production',
    //     httpOnly: true,
    //     maxAge: 1000 * 60 * 60 * 24 // 1 day
    // }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressMongoSanitize())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {

    console.log("profile", profile)

    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: "http://localhost:5173/login",
}),
    googleAuth,
    (req, res, next) => {
        res.redirect("http://localhost:5173/");
    }
);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/account', accountRoutes);
app.use('/budgets', budgetRoutes);
app.use('/goals', goalRoutes);
app.use('/notes', noteRoutes);
app.use('/bills', billRoutes);
app.use('/notifications', notificationRoutes);
module.exports = app;

