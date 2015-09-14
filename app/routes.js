let isLoggedIn = require('./middlewares/isLoggedIn');
let util = require('util');
let Twitter = require('twitter');
let then = require('express-then');

let scope = 'email';
let posts = require('../data/posts');

let networks = {
    twitter: {
        network: {
            icon: 'twitter',
            name: 'Twitter',
            class: 'btn-info'
        }
    }
};


module.exports = (app) => {
    let passport = app.passport;
    let twitterConfig = app.config.auth.twitter;

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

    app.get('/timeline', isLoggedIn, then(async (req, res) => {
        var twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        });

        let [tweets] = await twitterClient.promise.get('/statuses/home_timeline.json', {count: 20});

        posts = tweets.map(tweet => {
            return {
                id: tweet.id_str,
                image: tweet.user.profile_image_url,
                text: tweet.text,
                name: tweet.user.name,
                username: "@" + tweet.user.screen_name,
                liked: tweet.favorited,
                network: networks.twitter.network
            }
        });

        res.render('timeline.ejs', {
            message: req.flash('error'),
            posts: posts

        })
    }));

    app.get('/compose', isLoggedIn, (req, res) => {
        res.render('compose.ejs', {
            message: req.flash('error')
        })
    });

    app.post('/compose', isLoggedIn, then(async (req, res) => {
        let text = req.body.reply;

        if (text.length > 140){
            req.flash('error', 'Status is over 140 characters');
            res.redirect('/compose');
            return
        }
        if (!text){
            req.flash('error', 'Status cannot be empty');
            res.redirect('/compose');
            return
        }

        var twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        });

        await twitterClient.promise.post('/statuses/update', {status: text});

        res.redirect('/timeline');
    }));

    app.post('/like/:id', isLoggedIn, then(async(req, res) =>{
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        });

        let id = req.params.id;
        await twitterClient.promise.post('/favorites/create', {id});
        res.end()
    }));

    app.post('/unlike/:id', isLoggedIn, then(async(req, res) =>{
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        });

        let id = req.params.id;
        await twitterClient.promise.post('/favorites/destroy', {id});
        res.end()
    }));

    app.get('/reply/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        });

        let id = req.params.id;

        let [tweet] = await twitterClient.promise.get('/statuses/show/' + id);
        let post = {
            id: tweet.id_str,
            image: tweet.user.profile_image_url,
            text: tweet.text,
            name: tweet.user.name,
            username: '@'+tweet.user.screen_name,
            liked: tweet.favorited,
            network: networks.twitter.network
        };

        res.render('reply.ejs', {
            message: req.flash('error'),
            post: post
        })
    }));

    app.post('/reply/:id', isLoggedIn, then(async(req, res) => {
        let text = req.body.reply;
        let id = req.params.id;

        if (text.length > 140) {
            req.flash('error', 'Replay is over 140 characters');
            res.redirect('/reply/' + id);
            return
        }

        if (text.length < 1) {
            return req.flash('error', 'Replay cannot be empty');
            res.redirect('/reply/' + id);
            return
        }

        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        });

        await twitterClient.promise.post('/statuses/update', {
            status : text,
            in_reply_to_status_id: id
        });

        res.redirect('/timeline')
    }))



};
