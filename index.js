exports.register = function (server, options, next) {

    var saml = require('./lib/saml')
        .create(options).saml;

    server.expose('instance', saml);
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};

