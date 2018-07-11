const SchemeAuthenticator = require('./SchemeAuthenticate');

const SchemeImpl = (saml) => (server, options) => {
    return {
        authenticate: SchemeAuthenticator(saml)
    }
}

module.exports = SchemeImpl;