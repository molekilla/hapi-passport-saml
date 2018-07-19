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
    let session = request.state[cookieName];
    if (request.payload.SAMLRequest) {
        // Implement your SAMLRequest handling here
        if (onAssertReq) {
            return onAssertReq(request, reply);
        }
        console.log(request.payload);
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
                const updated = onAssertRes(profile);
                console.log(JSON.stringify(updated));
                session[samlCredsPropKey] = updated;
                return reply.redirect(session.redirectTo).state(cookieName, session);
            }
            throw new Error('onAssert is missing');
        });
    }
};
