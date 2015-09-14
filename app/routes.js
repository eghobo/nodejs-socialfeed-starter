let isLoggedIn = require('./middlewares/isLoggedIn');
let util = require('util');
let scope = 'email';

module.exports = (app) => {
    let passport = app.passport;

    app.get('/', (req, res) => res.render('index.ejs'));

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs', {message: req.flash('error')})
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error') })
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/auth/facebook', passport.authenticate('facebook', {scope}));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }));

    app.get('/auth/twitter', passport.authenticate('twitter', {scope}));

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }));
};
