const SamlController = require('./SamlController');
import { HapiSamlOptions } from './HapiSamlOptions';
import { HapiSaml } from './HapiSaml';
import { SchemeImpl } from './SchemeImpl';
import { Server } from 'hapi';

interface RegisterFun extends Function {
  (): any;
  attributes: {
    pkg: any;
  };
}
const register = <RegisterFun>(
  function(server: Server, options: HapiSamlOptions, next: any) {
    const hapiSaml = new HapiSaml(options);
    server.auth.scheme('saml', SchemeImpl(hapiSaml, options));

    const hapiSamlOptions = options.config;
    if (!hapiSamlOptions.assertHooks.onRequest){
        hapiSamlOptions.assertHooks.onRequest = (i: string) => {};
    }
    const cookieName = `hapi-passport-saml-${options.config.cookieName}`;

    server.decorate('server', 'saml', () => {
      return {
        requestLogout: (credentials, cb) => {
          const request = { user: credentials };
          if (!request.user) {
            return cb(new Error('Missing credentials'));
          }

          hapiSaml
            .getSamlLib()
            .getLogoutUrl(request, (err: any, url: string) => {
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
      handler: SamlController.getMetadata(hapiSaml)
      // config: hapiSamlOptions.routes.metadata.config,
    });

    // SAML assert
    server.route({
      method: 'POST',
      path: hapiSamlOptions.routes.assert.path,
      handler: SamlController.assert(
        hapiSaml.getSamlLib(),
        hapiSamlOptions.assertHooks.onResponse,
        hapiSamlOptions.assertHooks.onRequest,
        cookieName
      )
      // config: hapiSamlOptions.routes.assert.config,
    });

    next();
  }
);

register.attributes = {
  pkg: require('../package.json')
};

exports.register = register;
