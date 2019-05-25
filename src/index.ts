const SamlController = require('./SamlController');
import { HapiSamlOptions } from './HapiSamlOptions';
import { HapiSaml } from './HapiSaml';
import { SchemeImpl } from './SchemeImpl';
import { Server } from 'hapi';

const DEFAULT_COOKIE = `hapi-passport-saml-cookie`;
const SAML_CREDENTIALS_PROP = 'profile';
const SCHEME_NAME = 'saml';
interface RegisterFun extends Function {
  (): any;
  attributes: {
    pkg: any;
  };
}
const register = <RegisterFun>(
  function(server: Server, options: HapiSamlOptions) {
    const hapiSaml = new HapiSaml(options);
    let cookieName = DEFAULT_COOKIE;
    const samlCredsPropKey =
      options.config.cookieSamlCredentialPropKey || SAML_CREDENTIALS_PROP;
    server.auth.scheme(SCHEME_NAME, SchemeImpl(hapiSaml, options, samlCredsPropKey, DEFAULT_COOKIE));

    const hapiSamlOptions = options.config;
    if (!hapiSamlOptions.assertHooks.onRequest) {
      hapiSamlOptions.assertHooks.onRequest = (i: string) => {};
    }

    server.decorate('server', SCHEME_NAME, () => {
      return {
        requestLogout: (credentials, cb) => {
          const request = { user: credentials };
          if (!request.user) {
            return cb(new Error('Missing credentials'));
          }

          hapiSaml
            .getSamlLib()
            .getLogoutUrl(request, hapiSaml.props, (err: any, url: string) => {
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
        handler: SamlController.assert(
          hapiSaml.getSamlLib(),
          hapiSamlOptions.assertHooks.onResponse,
          hapiSamlOptions.assertHooks.onRequest,
          cookieName,
          samlCredsPropKey
        )
      }
      // config: hapiSamlOptions.routes.assert.config,
    });
  }
);

exports.plugin = {
  register,
  pkg: require('../package.json')
}
