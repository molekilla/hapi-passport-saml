/**
 * Login
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.login = (saml, cookieName) => (request, reply) => {
    saml.getAuthorizeUrl({
        headers: request.headers,
        body: request.payload,
        query: request.query
    }, function (err, loginUrl) {
        console.log(err);
        if (err !== null) {
            return reply().code(500);
        }

        let session = request.state;
        if (!session) {
            session = {};
        }
        session.redirectTo = request.query.r;
        return reply.redirect(loginUrl).state(cookieName, session);
    });
};

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
exports.assert = (saml, onAssertRes, onAssertReq, cookieName) => (request, reply) => {
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
            console.log(err);
            if (err !== null) {
                if (err.message.indexOf('SAML assertion expired') > -1) {
                    return reply.redirect('/');
                }
                return reply(err.message).code(500);
            }

            if (onAssertRes) {
                const resp = onAssertRes(request, reply);
                console.log(JSON.stringify(profile));
                session.profile = profile;
                return reply.redirect(session.redirectTo).state(cookieName, session);
            }

            throw new Error('onAssert is missing');
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