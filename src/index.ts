const SamlController = require('./SamlController');
import { HapiSamlOptions } from './HapiSamlOptions';
import { HapiSaml } from './HapiSaml';
import { SchemeImpl } from './SchemeImpl';

interface RegisterFun extends Function {
    (): any;
    attributes: {
        pkg: any;
    }
}
const register = <RegisterFun>function (server: any, options: HapiSamlOptions, next: any) {
    const hapiSaml = new HapiSaml(options);

    server.auth.scheme('saml', SchemeImpl(hapiSaml, options));
    const hapiSamlOptions = options.config;
    const cookieName = `hapi-passport-saml-${options.config.cookieName}`;

    server.method('logoutSaml', (credentials: any, cb: Function) => {
        const request = { user: credentials.profile };
        if (!request.user) {
            // return reply('Missing request.user').code(400);
            return cb(400);
        }

        hapiSaml.getSamlLib().getLogoutUrl(request, (err: any, url: string) => {
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
        // config: hapiSamlOptions.routes.metadata.config,
    });

    // SAML assert
    server.route({
        method: 'POST',
        path: hapiSamlOptions.routes.assert.path,
        handler: SamlController
            .assert(hapiSaml.getSamlLib(),
                hapiSamlOptions.assertHooks.onResponse,
                hapiSamlOptions.assertHooks.onRequest,
                cookieName),
        // config: hapiSamlOptions.routes.assert.config,
    });


    next();
}

register.attributes = {
    pkg: require('../package.json'),
};

exports.register = register;