const SchemeAuthenticate = (saml, onAssertRes, onAssertReq) => (request, reply) => {
    const samlLib = saml.getSamlLib();
    if (!request.auth.isAuthenticated) {
        samlLib.getAuthorizeUrl({
            headers: request.headers,
            body: request.payload,
            query: request.query
        }, (err, loginUrl) => {
            console.log(err);
            if (err !== null) {
                return reply().code(500);
            }
            return reply.redirect(loginUrl);
        });
        return;
    }
    
    return reply.continue();
}

module.exports = SchemeAuthenticate;