# hapi-passport-saml
 A Hapi plugin that wraps passport-saml for SAML SSO (as SP)

## Current release
1.0.0

## Install

`npm install hapi-passport-saml`

## Configuring Hapi server example

Uses Feide.no as IdP, read passport-saml for how to use options

```javascript
var Hapi = require('hapi');
var Boom = require('boom');
var debug = require('debug')('api:main');
var fs = require('fs');


// Create a server with a host and port
var server = module.exports = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

var decryptionCert = fs.readFileSync(__dirname + '/../../localhost-saml.crt').toString();

// Dependencies
server.app = {
  decryptionCert: decryptionCert
};


var controllers = [
    {
        register: require('../controllers/saml')
    }
];

var serverPlugins = [
  {
    register: require('hapi-passport-saml'),
    options: {
        callbackUrl: 'http://localhost/api/sso/v1/assert',
        host: 'localhost',
        protocol: 'http',
        entryPoint: 'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
        decryptionPvk: fs.readFileSync(__dirname + '/localhost-saml.pem').toString(),
        cert: fs.readFileSync(__dirname + '/feide-idp.crt').toString(),
        issuer: 'my-issuer-sp-saml'
    }
  }
];

server.register(serverPlugins, function(err) {


  server.register(controllers,
   {
     routes: {
       prefix: '/api'
     }
   }, function() {
    if (!module.parent) {
      server.start(function () {
        console.log('Server started at port ' + server.info.port);
      });
    }
  });

});
```


## References, Ideas and Based from
* [Saml2](https://github.com/Clever/saml2)
* [Passport-saml](https://github.com/bergie/passport-saml)

## License
MIT