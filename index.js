const SchemeImpl = require('./lib/SchemeImpl');
const SamlController = require('./lib/SamlController');
const HapiSaml = require('./lib/HapiSaml');

const register = function (server, options, next) {
    const hapiSaml = new HapiSaml(options);
    // hapiSaml.load(options);

    server.auth.scheme('saml', SchemeImpl(hapiSaml));

    // SAML metadata
    server.route({
        method: 'GET',
        path: options.metadata.path,
        handler: SamlController.getMetadata(hapiSaml.getSamlLib()),
        config: options.metadata.config,
    });

    // SAML assert
    server.route({
        method: 'POST',
        path: options.assert.path,
        handler: SamlController.assert(hapiSaml.getSamlLib(), options.onAssertResponse, options.onAssertRequest),
        config: options.assert.config,
    });

    next();
}

register.attributes = {
    pkg: require('./package.json'),
};

exports.register = register;