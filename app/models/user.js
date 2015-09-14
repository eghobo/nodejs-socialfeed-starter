let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
        local: {
            email: String,
            password: String
        },
        linkedin: {
            id: String,
            token: String,
            email: String,
            name: String
        },
        facebook: {
            id: String,
            token: String,
            email: String,
            name: String
        },
        twitter: {
            id: String,
            token: String,
            email: String,
            displayName: String,
            username: String
        },
        google: {
            id: String,
            token: String,
            email: String,
            name: String
        }
    }
);

userSchema.methods.generateHash = async function (password) {
    throw new Error('Not Implemented.')
};

userSchema.methods.validatePassword = async function (password) {
    throw new Error('Not Implemented.')
};

userSchema.methods.linkAccount = function (type, values) {
    return this['link' + type.charAt(0).toUpperCase() + type.substring(1) + 'Account'](values)
};

userSchema.methods.linkLocalAccount = function ({email, password}) {
    throw new Error('Not Implemented.')
};

userSchema.methods.linkFacebookAccount = function ({account, token}) {
    this.facebook.id = account.id;
    this.facebook.name = account.displayName;
    this.facebook.token = token;
};

userSchema.methods.linkTwitterAccount = function ({account, token}) {
    this.twitter.id = account.id;
    this.twitter.username = account.username;
    this.twitter.displayName = account.displayName;
    this.twitter.token = token;
};

userSchema.methods.linkGoogleAccount = function ({account, token}) {
    throw new Error('Not Implemented.')
};

userSchema.methods.linkLinkedinAccount = function ({account, token}) {
    throw new Error('Not Implemented.')
};

userSchema.methods.unlinkAccount = function (type) {
    throw new Error('Not Implemented.')
};

module.exports = mongoose.model('User', userSchema);
