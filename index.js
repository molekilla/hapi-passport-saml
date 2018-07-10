const samlCtrl = require('./lib');
const saml = require('passport-saml/lib/passport-saml/saml');
class HapiSaml {
    constructor() {
        this.saml = null;
        this.props = {};
    }

    load(options) {
        if (options.saml) {
            throw new Error('Missing options.saml');
        }
        if (options.routes) {
            throw new Error('Missing options.routes');
        }
        if (options.onAssertRequest) {
            throw new Error('Missing options.onAssertRequest');
        }
        if (options.onAssertResponse) {
            throw new Error('Missing options.onAssertResponse');
        }
        this.saml = new saml.SAML(options.saml);
        this.props = { ...options.saml };
    }

    getSamlLib() {
        return this.saml;
    }
}

const register = function(plugin, options, next) {
    const hapiSaml = new HapiSaml();
    hapiSaml.load(options.saml);

    plugin.route({
        method: 'GET',
        path: options.routes.metadata.path,
        handler: samlCtrl.getMetadata(hapiSaml),
        config: options.routes.metadata.config,
    });

    plugin.route({
        method: 'GET',
        path: options.routes.login.path,
        handler: samlCtrl.login(hapiSaml),
        config: options.routes.login.config,
    });

    plugin.route({
        method: 'POST',
        path: options.routes.assert.path,
        handler: samlCtrl.assert(hapiSaml, options.onAssertResponse, options.onAssertRequest),
        config: options.routes.assert.config,
    });

    plugin.route({
        method: 'GET',
        path: options.routes.logout.path,
        handler: samlCtrl.logout(hapiSaml),
        config: options.routes.logout.config,
    });


    next();
}

register.attributes = {
    pkg: require('./package.json'),
};

exports.register = register;