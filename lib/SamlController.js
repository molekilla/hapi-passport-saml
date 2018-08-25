"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.getMetadata = (saml) => (request, reply) => {
    return reply(saml.getSamlLib().generateServiceProviderMetadata(saml.props.decryptionCert)).type('application/xml');
};
/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.assert = (saml, onAssertRes, onAssertReq, cookieName, samlCredsPropKey) => (request, reply) => {
    if (request.payload.SAMLRequest) {
        // Implement your SAMLRequest handling here
        if (onAssertReq) {
            return onAssertReq(request, reply);
        }
        return reply(500);
    }
    if (request.payload.SAMLResponse) {
        // Handles SP use cases, e.g. IdP is external and SP is Hapi
        saml.validatePostResponse(request.payload, (err, profile) => {
            if (err !== null) {
                if (err.message.indexOf('SAML assertion expired') > -1) {
                    return reply.redirect('/');
                }
                return reply(err.message).code(500);
            }
            if (onAssertRes) {
                // the callback shall return the reply object after using it to redirect/response.
                const replyFromCallback = onAssertRes(profile, request, reply).state(cookieName, profile);
                if (replyFromCallback) {
                    return replyFromCallback.state(cookieName, profile);
                }
                return reply.state(cookieName, profile).code(200);
            }
            throw new Error('onAssert is missing');
        });
    }
};
