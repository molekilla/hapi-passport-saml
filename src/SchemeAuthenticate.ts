import { SchemeConfig } from './SchemeConfig';
import { HapiSaml } from './HapiSaml';
import { Request, IStrictReply, Response } from 'hapi';
export const SchemeAuthenticate = (saml: HapiSaml, settings: SchemeConfig) => (
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

  if (session && session.profile) {
    return reply.continue({
      credentials: session.profile
    });
  }

  return reply().code(401);
};
