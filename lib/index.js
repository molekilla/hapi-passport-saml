"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SamlController = require('./SamlController');
const HapiSaml_1 = require("./HapiSaml");
const SchemeImpl_1 = require("./SchemeImpl");
const register = function (server, options, next) {
    const hapiSaml = new HapiSaml_1.HapiSaml(options);
    server.auth.scheme('saml', SchemeImpl_1.SchemeImpl(hapiSaml, options));
    const hapiSamlOptions = options.config;
    const cookieName = `hapi-passport-saml-${options.config.cookieName}`;
    server.method('logoutSaml', (credentials, cb) => {
        const request = { user: credentials.profile };
        if (!request.user) {
            // return reply('Missing request.user').code(400);
            return cb(400);
        }
        hapiSaml.getSamlLib().getLogoutUrl(request, (err, url) => {
            if (err !== null) {
                // return reply.code(500);
                return cb(500);
            }
            // return reply.redirect(url);
            return cb(null, url);
        });
    });
    // SAML metadata
    server.route({
        method: 'GET',
        path: hapiSamlOptions.routes.metadata.path,
        handler: SamlController.getMetadata(hapiSaml.getSamlLib()),
    });
    // SAML assert
    server.route({
        method: 'POST',
        path: hapiSamlOptions.routes.assert.path,
        handler: SamlController
            .assert(hapiSaml.getSamlLib(), hapiSamlOptions.assertHooks.onResponse, hapiSamlOptions.assertHooks.onRequest, cookieName),
    });
    next();
};
register.attributes = {
    pkg: require('../package.json'),
};
exports.register = register;
