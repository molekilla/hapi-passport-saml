import { SchemeConfig } from './SchemeConfig';
import { HapiSaml } from './HapiSaml';
import { Request, IStrictReply, Response } from 'hapi';
export const SchemeAuthenticate = (saml: HapiSaml, settings: SchemeConfig, samlCredsPropKey: string) => (
  request: Request,
  reply: any
) => {
  let session = request.state[settings.cookie];

  if (!session) {
    saml.getSamlLib().getAuthorizeUrl(
      {
        headers: request.headers,
        body: request.payload,
        query: request.query
      },
      function(err: any, loginUrl: string) {
        console.log(err);
        if (err !== null) {
          return reply().code(500);
        }

        session = {};
        session.redirectTo = request.path;
        return reply.redirect(loginUrl).state(settings.cookie, session);
      }
    );
    return;
  }

  if (session && session[samlCredsPropKey]) {
    return reply.continue({
      credentials: session[samlCredsPropKey]
    });
  }

  return reply().code(401);
};
