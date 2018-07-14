import { HapiSaml } from './HapiSaml';
import { Request } from 'hapi';

/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.getMetadata = (saml: HapiSaml) => (request: Request, reply: any) => {
  return reply(
    saml.getSamlLib().generateServiceProviderMetadata(saml.props.decryptionCert)
  ).type('application/xml');
};

/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.assert = (
  saml: any,
  onAssertRes: Function,
  onAssertReq: Function,
  cookieName: string
) => (request: Request, reply: any) => {
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
    saml.validatePostResponse(request.payload, (err: any, profile: object) => {
      if (err !== null) {
        if (err.message.indexOf('SAML assertion expired') > -1) {
          return reply.redirect('/');
        }
        return reply(err.message).code(500);
      }

      if (onAssertRes) {
        const updated = onAssertRes(profile);
        console.log(JSON.stringify(updated));
        session.profile = updated;
        return reply.redirect(session.redirectTo).state(cookieName, session);
      }

      throw new Error('onAssert is missing');
    });
  }
};
