const express = require('express');
const app = express();

const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const connectToDb = require('./db/db');
connectToDb();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleAuth = require('./middlewares/googleAuth');

const userRoutes = require('./routes/UserRoutes');
const transactionRoutes = require('./routes/TransactionRoutes');
const accountRoutes = require('./routes/AccountRoutes');
const budgetRoutes = require('./routes/BudgetRoutes');
const goalRoutes = require('./routes/GoalRoutes');
const noteRoutes = require('./routes/NoteRoutes');
const billRoutes = require('./routes/BillRoutes');
const notificationRoutes = require('./routes/NotificationRoutes');

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .replace(/\/$/, '');

app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  }
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
    
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${frontendUrl}/login?error=auth_failed`,
        session: true
    }),
    googleAuth
);



app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/account', accountRoutes);
app.use('/budgets', budgetRoutes);
app.use('/goals', goalRoutes);
app.use('/notes', noteRoutes);
app.use('/bills', billRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Server running');
});

module.exports = app;
