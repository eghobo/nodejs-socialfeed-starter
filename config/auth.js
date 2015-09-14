// expose our config directly to our application using module.exports
module.exports = {
    'development': {
        'facebook': {
            'consumerKey': '421253761397907',
            'consumerSecret': 'c1e9c50d4cbe8794ac114af442624d94',
            'callbackUrl': 'http://socialauthenticator.com:8000/auth/facebook/callback'
        },
        'twitter': {
            'consumerKey': '8PI3OAMN6Z20SiOXU07WRwJLO',
            'consumerSecret': 'YiOfgKtWGKhiZspsA6eOK1iROzgFZG7YZycqjHWPaiN058IFUB',
            'callbackUrl': 'http://socialauthenticator.com:8000/auth/twitter/callback'
        }
    }
};