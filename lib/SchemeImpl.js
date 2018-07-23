"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemeAuthenticate_1 = require("./SchemeAuthenticate");
exports.SchemeImpl = (saml, options, propKey) => (server, settings) => {
    if (!settings) {
        throw new Error('Missing scheme config');
    }
    const cookieOptions = {
        encoding: 'iron',
        path: '/',
        password: settings.password,
        isSecure: settings.isSecure !== false,
        isHttpOnly: settings.isHttpOnly !== false,
        // isSameSite: 'Strict',
        ttl: settings.ttl
        //domain: settings.domain,
        //ignoreErrors: true,
        //clearInvalid: true
    };
    settings.cookie = options.config.cookieName || 'hapi-passport-saml-cookie';
    try {
        //if (!settings.cookie) {
        server.state('__' + settings.cookie, cookieOptions);
        //}
    }
    catch (e) {
        throw e;
    }
    return {
        authenticate: SchemeAuthenticate_1.SchemeAuthenticate(saml, settings, propKey)
    };
};
