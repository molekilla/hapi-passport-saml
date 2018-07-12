const SchemeImpl = require('./lib/SchemeImpl');
const SamlController = require('./lib/SamlController');
const HapiSaml = require('./lib/HapiSaml');

const register = function (server, options, next) {
    const hapiSaml = new HapiSaml(options);

    server.auth.scheme('saml', SchemeImpl(hapiSaml, options));
    const hapiSamlOptions = options.hapiSaml;

    // SAML metadata
    server.route({
        method: 'GET',
        path: hapiSamlOptions.routes.initiateAuthentication.path,
        handler: SamlController.login(hapiSaml.getSamlLib(), options.hapiSaml.cookieName),
        config: hapiSamlOptions.routes.initiateAuthentication.config,
    });

    // SAML metadata
    server.route({
        method: 'GET',
        path: hapiSamlOptions.routes.metadata.path,
        handler: SamlController.getMetadata(hapiSaml.getSamlLib()),
        config: hapiSamlOptions.routes.metadata.config,
    });

    // SAML assert
    server.route({
        method: 'POST',
        path: hapiSamlOptions.routes.assert.path,
        handler: SamlController
            .assert(hapiSaml.getSamlLib(),
                hapiSamlOptions.assertHooks.onResponse,
                hapiSamlOptions.assertHooks.onRequest, , options.hapiSaml.cookieName),
        config: hapiSamlOptions.routes.assert.config,
    });

    next();
}

register.attributes = {
    pkg: require('./package.json'),
};

exports.register = register;