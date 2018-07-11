const saml = require('passport-saml/lib/passport-saml/saml');

class HapiSaml {
    constructor(options) {
        this.saml = null;
        this.props = {};
        this.load(options);
    }

    load(options) {
        if (!options.saml) {
            throw new Error('Missing options.saml');
        }
        if (!options.metadata) {
            throw new Error('Missing options.metadata');
        }
        if (!options.onAssertRequest) {
            throw new Error('Missing options.onAssertRequest');
        }
        if (!options.onAssertResponse) {
            throw new Error('Missing options.onAssertResponse');
        }
        this.saml = new saml.SAML(options.saml);
        this.props = { ...options.saml };
        this.props.decryptionCert = options.decryptionCert;
    }

    getSamlLib() {
        return this.saml;
    }
}

module.exports = HapiSaml;