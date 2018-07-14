import { SchemeAuthenticate } from './SchemeAuthenticate';
import { SchemeConfig } from './SchemeConfig';
import { HapiSamlOptions } from './HapiSamlOptions';
import { HapiSaml } from './HapiSaml';

export const SchemeImpl = (saml: HapiSaml, options: HapiSamlOptions) => (
  server: any,
  settings?: SchemeConfig | any
) => {
  if (!settings) {
    throw new Error('Missing scheme config');
  }

  const cookieOptions = {
    encoding: 'iron',
    path: '/',
    password: settings.password,
    isSecure: settings.isSecure !== false, // Defaults to true
    isHttpOnly: settings.isHttpOnly !== false, // Defaults to true
    // isSameSite: 'Strict',
    ttl: settings.ttl,
    //domain: settings.domain,
    ignoreErrors: true,
    clearInvalid: true
  };
  settings.cookie =
    settings.cookie || 'hapi-passport-saml-' + options.config.cookieName;
  server.state(settings.cookie, cookieOptions);

  return {
    authenticate: SchemeAuthenticate(saml, settings)
  };
};
