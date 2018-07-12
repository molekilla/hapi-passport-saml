const SchemeAuthenticate = (saml, settings, hooks) => (request, reply) => {
    const session = request.state[settings.cookie];
    const { redirectTo } = session;
    if (!redirectTo) {
        return reply.redirect(`${settings.requestAuthenticationRoute}?r=${request.path}`);
    }
    console.log(request.state);
    return reply.continue({
        credentials: session.profile
    });
}


module.exports = SchemeAuthenticate;