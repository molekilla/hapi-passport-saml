exports.register = function (server, options, next) {

    var saml = require('./lib/saml')
        .create(options.templates, options.logger, options.config);

    server.expose('instance', saml);
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};

