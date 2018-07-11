const scheme = require('./lib/scheme');
const samlCtrl = require('./lib');
const saml = require('passport-saml/lib/passport-saml/saml');
class HapiSaml {
    constructor() {
        this.saml = null;
        this.props = {};
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

const register = function (server, options, next) {
    const hapiSaml = new HapiSaml();
    hapiSaml.load(options);

    server.auth.scheme('saml', scheme(hapiSaml));

    server.route({
        method: 'GET',
        path: options.metadata.path,
        handler: samlCtrl.getMetadata(hapiSaml),
        config: options.metadata.config,
    });

    server.route({
        method: 'POST',
        path: options.routes.assert.path,
        handler: samlCtrl.assert(hapiSaml, options.onAssertResponse, options.onAssertRequest),
        config: options.routes.assert.config,
    });

    next();
}

register.attributes = {
    pkg: require('./package.json'),
};

exports.register = register;