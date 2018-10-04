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
/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} h - A Hapi response toolkit
 */
exports.getMetadata = (saml) => (request, h) => {
    const response = h.response(saml.getSamlLib().generateServiceProviderMetadata(saml.props.decryptionCert));
    response.type('application/xml');
    return response;
};
/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} h - A Hapi response toolkit
 */
exports.assert = (saml, onAssertRes, onAssertReq, cookieName, samlCredsPropKey) => (request, h) => __awaiter(this, void 0, void 0, function* () {
    if (request.payload.SAMLRequest) {
        // Implement your SAMLRequest handling here
        if (onAssertReq) {
            return onAssertReq(request, h);
        }
        throw new Error('Invalid assertion request');
    }
    if (request.payload.SAMLResponse) {
        // Handles SP use cases, e.g. IdP is external and SP is Hapi
        try {
            const profile = yield new Promise((resolve, reject) => {
                saml.validatePostResponse(request.payload, (err, profile) => {
                    if (err)
                        reject(err);
                    else
                        resolve(profile);
                });
            });
            if (onAssertRes) {
                // the callback shall return the reply object after using it to redirect/response.
                const replyFromCallback = onAssertRes(profile, request, h);
                replyFromCallback.state(cookieName, { [samlCredsPropKey]: profile });
                return replyFromCallback;
            }
            throw Boom.badImplementation('onAssert is missing');
        }
        catch (err) {
            if (err.message.indexOf('SAML assertion expired') > -1) {
                return h.redirect('/');
            }
            throw Boom.unauthorized(err.message, 'saml');
        }
    }
});
