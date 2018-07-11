/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.getMetadata = (saml) => (request, reply) => {
    return reply(saml.generateServiceProviderMetadata(saml.props.decryptionCert))
        .type('application/xml');
};


/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.assert  = (saml, onAssertRes, onAssertReq) => (request, reply) => {
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
            console.log(err);
            console.log(profile);
            if (err !== null) {
                return reply().code(500);
            }

            if (onAssertRes) {
                const resp = onAssertRes(request, reply);
                return reply(JSON.stringify(profile));
            }

            throw new Error('onAssert is missing');
            // // Save name_id and session_index for logout
            // // Note:  In practice these should be saved in the user session, not globally.
            // var name_id = profile.nameID;
            // var session_index = profile.sessionIndex;

            // request.server.app.name_id = name_id;
            // request.server.app.session_index = session_index;
            // return reply("Hello " + profile.nameID + "!");
        });
    }
};



/**
 * Logout
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.logout = (saml) => (request, reply) => {
    const samlLib = saml;

    if (!request.user) {
        return reply('Missing request.user').code(400);
    }

    samlLib.getLogoutUrl(request, (err, url) => {
        if (err !== null) {
            return reply.code(500);
        }
        return reply.redirect(url);
    });
};