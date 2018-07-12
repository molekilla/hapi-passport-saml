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
        if (!options.hapiSaml && !options.hapiSaml.routes) {
            throw new Error('Missing options.hapiSaml.routes');
        }
        if (!options.hapiSaml.routes.metadata) {
            throw new Error('Missing options.hapiSaml.routes.metadata');
        }
        if (!options.hapiSaml.routes.initiateAuthentication) {
            throw new Error('Missing options.hapiSaml.routes.initiateAuthentication');
        }
        if (!options.hapiSaml.routes.assert) {
            throw new Error('Missing options.hapiSaml.routes.assert');
        }                        
        if (!options.hapiSaml && !options.hapiSaml.assertHooks.onRequest) {
            throw new Error('Missing options.hapiSaml.assertHooks.onRequest');
        }
        if (!options.hapiSaml && !options.hapiSaml.assertHooks.onResponse) {
            throw new Error('Missing options.hapiSaml.assertHooks.onResponse');
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