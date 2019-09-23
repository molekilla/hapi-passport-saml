const Boom = require('@hapi/boom');
import {SchemeConfig} from './SchemeConfig';
import {HapiSaml} from './HapiSaml';
import {Request} from 'hapi';

export const SchemeAuthenticate = (
    saml: HapiSaml,
    settings: SchemeConfig,
    samlCredsPropKey: string
) => async (request: Request, h: any) => {
    const state = request.state;
    let session = state[settings.cookie];

    if (!session) {
        if (saml.getSamlProps().authnRequestBinding === 'HTTP-POST') {
            console.log('HTTP-POST');
            const loginForm = await new Promise((resolve, reject) => {
                const query = request.query;
                query.RelayState = request.path;

                saml.getSamlLib().getAuthorizeForm({
                    headers: request.headers,
                    body: request.payload,
                    query: query
                },
                    function (err: any, loginUrl: string) {
                        if (err) reject(err);
                        else resolve(loginUrl);
                    });
            });
            return h.response(loginForm).takeover();
        } else {
            const loginUrl = await new Promise((resolve, reject) => {
                const query = request.query;
                query.RelayState = request.path;

                saml.getSamlLib().getAuthorizeUrl(
                    {
                        headers: request.headers,
                        body: request.payload,
                        query: query
                    },
                    saml.props,
                    function (err: any, loginUrl: string) {
                        if (err) reject(err);
                        else resolve(loginUrl);
                    });
            });

            return h.redirect(loginUrl).takeover();
        }


    }

    if (session && session[samlCredsPropKey]) {
        if (settings.keepAlive) {
            h.state(settings.cookie, session);
        }
        return h.authenticated({
            credentials: session[samlCredsPropKey]
        });
    }
    if (request.auth.mode === 'try') {
        throw Boom.unauthorized('Not authenticated');
    }

    throw Boom.unauthorized('Unauthorized', 'saml');
};
