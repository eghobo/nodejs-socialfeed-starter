let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let nodeifyit = require('nodeifyit');
let crypto = require('crypto');
let SALT = 'CodePathHeartNodeJS';
let User = require('../models/user');
let util = require('util');
let FacebookStrategy = require('passport-facebook').Strategy;
let TwitterStrategy = require('passport-twitter').Strategy;

require('songbird');

function useExternalPassportStrategy(OauthStrategy, config, field) {
    config.passReqToCallback = true;
    passport.use(new OauthStrategy(config, nodeifyit(authCB, {spread: true})));

    async function authCB(req, token, _ignored_, account) {
        console.log('Authorizing account: ', account);

        let conditions = {};
        conditions[account.provider + '.id'] = account.id;
        let user = await User.promise.findOne(conditions);
        if (!user) {
            user = new User();
        }
        await user.linkAccount(account.provider, {account: account, token: token});
        await user.save();

        return user;
    }
}

function configure(config) {
    // Required for session support / persistent login sessions
    passport.serializeUser(nodeifyit(async (user) => user._id));

    passport.deserializeUser(nodeifyit(async (id) => {
        return await User.findById(id).exec();
    }));

    useExternalPassportStrategy(FacebookStrategy, {
        clientID: config.facebook.consumerKey,
        clientSecret: config.facebook.consumerSecret,
        callbackURL: config.facebook.callbackUrl
    }, 'facebook');

    useExternalPassportStrategy(TwitterStrategy, {
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        callbackURL: config.twitter.callbackUrl
    }, 'twitter');

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        failureFlash: true
    }, nodeifyit(async (email, password) => {
        email = (email || '').toLowerCase();
        let user = await User.promise.findOne({'local.email': email});

        if (!user) {
            return [false, {message: 'Invalid email'}]
        }

        let passwordHash = await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256');
        if (passwordHash.toString('hex') !== user.local.password) {
            return [false, {message: 'Invalid password'}]
        }
        return user
    }, {spread: true})));


    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
        failureFlash: true
    }, nodeifyit(async (req, email, password) => {
        email = (email || '').toLowerCase();
        // Is the email taken?
        if (await User.promise.findOne({'local.email': email})) {
            return [false, {message: 'That email is already taken.'}]
        }

        // create the user
        let user = new User();
        user.local.email = email;
        user.local.password = (await crypto.promise.pbkdf2(password, SALT, 4096, 512, 'sha256')).toString('hex');

        try {
            return await user.save()
        }
        catch(e) {
            console.log(util.inspect(e));
            return [false, {message: e.message}]
        }
    }, {spread: true})));

    return passport
}

module.exports = {passport, configure};
