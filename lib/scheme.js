const schemeAuthenticator = require('./authenticate');

const schemeImpl = (saml) => (server, options) => {


    return {
        authenticate: schemeAuthenticator(saml)
    }
}

module.exports = schemeImpl;