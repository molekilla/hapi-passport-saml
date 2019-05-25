const Boom = require('boom');
import { HapiSaml } from './HapiSaml';
import { Request } from 'hapi';

/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} h - A Hapi response toolkit
 */
exports.getMetadata = (saml: HapiSaml) => (request: Request, h: any) => {
  const response = h.response(saml.getSamlLib().generateServiceProviderMetadata(saml.props.decryptionCert, saml.props.signingCert));
  response.type('application/xml');
  return response;
};

/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} h - A Hapi response toolkit
 */
exports.assert = (
  saml: any,
  onAssertRes: Function,
  onAssertReq: Function,
  cookieName: string,
  samlCredsPropKey: string
) => async (request: Request, h: any) => {
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
      const profile = await new Promise((resolve, reject) => {
        saml.validatePostResponse(request.payload, (err: any, profile: object) => {
          if(err) reject(err);
          else resolve(profile);
        });
      });

      if (onAssertRes) {
        // the callback shall return the reply object after using it to redirect/response.
        const replyFromCallback = onAssertRes(profile, request, h);
        replyFromCallback.state(cookieName, {[samlCredsPropKey]: profile})
        return replyFromCallback;
      }

      throw Boom.badImplementation('onAssert is missing');
    } catch(err) {
      if (err.message.indexOf('SAML assertion expired') > -1) {
        return h.redirect('/');
      }
      throw Boom.unauthorized(err.message, 'saml');
    }
  }
};
