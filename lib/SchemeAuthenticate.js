"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Boom = require('boom');
exports.SchemeAuthenticate = (saml, settings, samlCredsPropKey) => (request, h) => __awaiter(this, void 0, void 0, function* () {
    const state = request.state;
    let session = state[settings.cookie];
    if (!session) {
        const loginUrl = yield new Promise((resolve, reject) => {
            saml.getSamlLib().getAuthorizeUrl(
                {
                    headers: request.headers,
                    body: request.payload,
                    query: request.query
                },
                saml.props,
                function (err, loginUrl) {
                    if (err)
                        reject(err);
                    else
                        resolve(loginUrl);
                });
        });
        const idpLoginUrl = new URL(loginUrl.toString());
        idpLoginUrl.search = `RelayState=${request.path}`;
        return h.redirect(idpLoginUrl).takeover();
    }
    if (session && session[samlCredsPropKey]) {
        if(settings.keepAlive) {
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
});
