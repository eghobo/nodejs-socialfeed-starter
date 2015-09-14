// expose our config directly to our application using module.exports
module.exports = {
    'development': {
        'facebook': {
            'consumerKey': 'KEY',
            'consumerSecret': 'SECRET',
            'callbackUrl': 'http://socialauthenticator.com:8000/auth/facebook/callback'
        },
        'twitter': {
            'consumerKey': 'KEY',
            'consumerSecret': 'SECRET',
            'callbackUrl': 'http://socialauthenticator.com:8000/auth/twitter/callback'
        }
    }
};