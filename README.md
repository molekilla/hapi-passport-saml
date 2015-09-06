# hapi-passport-saml
 A Hapi plugin that wraps passport-saml for SAML SSO (as SP)

## Install

`npm install hapi-passport-saml`

## Configuring Hapi server example
```
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

### Hapi controller (routes) using hapi-passport-saml

```
var debug = require('debug')('saml:ctrl');



/**
 * Endpoint to retrieve metadata
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.metadata = function (request, reply) {
    var saml = request.server.plugins['hapi-passport-saml'].instance;
    return reply(saml.generateServiceProviderMetadata(request.server.app.decryptionCert))
            .type('application/xml');
};

/**
 * Login
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.login = function (request, reply) {
    var saml = request.server.plugins['hapi-passport-saml'].instance;
    
    saml.getAuthorizeUrl({
        headers: request.headers,
        body: request.payload,
        query: request.query
    }, function(err, loginUrl) {
        if (err !== null)
            return reply.code(500);
        return reply.redirect(loginUrl);        
    });
};

/**
 * Assert endpoint for when login completes
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.assert = function (request, reply) {
    var saml = request.server.plugins['hapi-passport-saml'].instance;

    var options = {
        request_body: request.payload
    };
    
    if (request.payload.SAMLRequest) {
    // Implement your SAMLRequest handling here
        debug(request.payload);
        return reply(500);
    }
    if (request.payload.SAMLResponse) {
        // Handles SP use cases, e.g. IdP is external and SP is Hapi
        saml.validatePostResponse(request.payload, function(err, profile) {
            debug(err);
            debug(profile);
            if (err !== null)
                return reply.code(500);

            // Save name_id and session_index for logout
            // Note:  In practice these should be saved in the user session, not globally.
            var name_id = profile.nameID;
            var session_index = profile.sessionIndex;

            request.server.app.name_id = name_id;
            request.server.app.session_index = session_index;
            return reply("Hello " + profile.nameID+"!");
        });
    }
};



/**
 * Logout
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.logout = function (request, reply) {
    var options = {
        name_id: request.server.app.name_id,
        session_index: request.server.app.session_index
    };

    var saml = request.server.plugins['hapi-passport-saml'].instance;
    
    saml.getLogoutUrl(request, function(err, url) {
        if (err !== null)
            return reply.code(500);
        return reply.redirect(url);        
    });
};

```

## References, Ideas and Based from
* [Saml2](https://github.com/Clever/saml2)
* [Passport-saml](https://github.com/bergie/passport-saml)

## License
MIT