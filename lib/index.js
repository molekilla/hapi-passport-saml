"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SamlController = require('./SamlController');
const HapiSaml_1 = require("./HapiSaml");
const SchemeImpl_1 = require("./SchemeImpl");
const register = (function (server, options, next) {
    const hapiSaml = new HapiSaml_1.HapiSaml(options);
    let cookieName = options.config.cookieName || `hapi-passport-saml-cookie`;
    const samlCredsPropKey = options.config.cookieSamlCredentialPropKey || 'profile';
    server.auth.scheme('saml', SchemeImpl_1.SchemeImpl(hapiSaml, options, samlCredsPropKey));
    const hapiSamlOptions = options.config;
    if (!hapiSamlOptions.assertHooks.onRequest) {
        hapiSamlOptions.assertHooks.onRequest = (i) => { };
    }
    server.decorate('server', 'saml', () => {
        return {
            requestLogout: (credentials, cb) => {
                const request = { user: credentials };
                if (!request.user) {
                    return cb(new Error('Missing credentials'));
                }
                hapiSaml
                    .getSamlLib()
                    .getLogoutUrl(request, (err, url) => {
                    if (err !== null) {
                        return cb(err);
                    }
                    return cb(null, url);
                });
            },
            getCookieName: () => {
                return cookieName;
            }
        };
    });
    // SAML metadata
    server.route({
        method: 'GET',
        path: hapiSamlOptions.routes.metadata.path,
        config: {
            auth: false,
            handler: SamlController.getMetadata(hapiSaml)
        }
        // config: hapiSamlOptions.routes.metadata.config,
    });
    // SAML assert
    server.route({
        method: 'POST',
        path: hapiSamlOptions.routes.assert.path,
        config: {
            auth: false,
            handler: SamlController.assert(hapiSaml.getSamlLib(), hapiSamlOptions.assertHooks.onResponse, hapiSamlOptions.assertHooks.onRequest, cookieName, samlCredsPropKey)
        }
        // config: hapiSamlOptions.routes.assert.config,
    });
    next();
});
register.attributes = {
    pkg: require('../package.json')
};
exports.register = register;
