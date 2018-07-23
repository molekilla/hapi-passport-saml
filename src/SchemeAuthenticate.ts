import { SchemeConfig } from './SchemeConfig';
import { HapiSaml } from './HapiSaml';
import { Request, IStrictReply, Response } from 'hapi';
export const SchemeAuthenticate = (
  saml: HapiSaml,
  settings: SchemeConfig,
  samlCredsPropKey: string
) => (request: Request, reply: any) => {
  const state = request.state;
  const cookieAuth = (request as any).cookieAuth;
  let session = state['__'+settings.cookie];

  console.log('current state', state);
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
        console.log('cookie', settings.cookie)
        console.log('about to redirect...');
        session = {};
        session.redirectTo = request.path;

        return reply.redirect(loginUrl).state('__'+settings.cookie, session);
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
