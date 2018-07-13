const SchemeAuthenticate = (saml, settings) => (request, reply) => {
    const session = request.state[settings.cookie];

    if (!session) {
        return reply.redirect(`${settings.requestAuthenticationRoute}?r=${request.path}`);
    }

    if (session.profile) {
        return reply.continue({
            credentials: session.profile
        });
    }

    return reply().code(401);
}


module.exports = SchemeAuthenticate;