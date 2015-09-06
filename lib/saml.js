var Hapi = require('hapi');
var debug = require('debug')('api:main');
var fs = require('fs');

var saml = require('passport-saml/lib/passport-saml/saml');




var SamlLib = function SamlLib(options) {
    this.saml = new saml.SAML(options);

    return this;
};

SamlLib.create = function (options) {
    return new SamlLib(options);
};

module.exports = SamlLib;
