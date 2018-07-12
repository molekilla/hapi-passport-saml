const SchemeAuthenticator = require('./SchemeAuthenticate');

const SchemeImpl = (saml, options) => (server, settings) => {
    const cookieOptions = {
        encoding: 'iron',
        path: '/',
        password: settings.password,
        isSecure: settings.isSecure !== false, // Defaults to true
        isHttpOnly: settings.isHttpOnly !== false, // Defaults to true
        // isSameSite: 'Strict',
        ttl: settings.ttl,
        // domain: settings.domain,
        // ignoreErrors: true,
        // clearInvalid: true
    };
    settings.cookie = settings.cookie || 'hapi-saml-' + settings.name;
    server.state(settings.cookie, cookieOptions);

    settings.requestAuthenticationRoute = options.hapiSaml.routes.initiateAuthentication.path;

    return {
        authenticate: SchemeAuthenticator(saml, settings, options.hapiSaml.assertHooks),
    }
}

module.exports = SchemeImpl;