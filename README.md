# hapi-passport-saml
A Hapi plugin that wraps passport-saml for SAML SSO (as SP)
with support for multiple strategies

**Version 2.1.0 is compatible with Hapi 17. For previous version, stay with 1.x.x**

## Current release
2.1.0

## Install

`npm install hapi-passport-saml`

## Configuration

Uses `samlidp.io` as IdP, read passport-saml for how to use options

```javascript
const samlOptions = {
  // passport saml settings
  saml: {
    callbackUrl: 'http://localhost/api/sso/v1/assert',
    logoutCallbackUrl: 'http://localhost/api/sso/v1/notifylogout',
    logoutUrl: 'https://my-idp.samlidp.io/saml2/idp/SingleLogoutService.php',
    host: 'localhost',
    protocol: 'http',
    entryPoint: 'https://my-idp.samlidp.io/saml2/idp/SSOService.php',
    // Service Provider Private Signing Key
    privateCert: fs.readFileSync(__dirname + '/privateSigning.pem', 'utf-8'),
    // Service Provider Private Encryption Key
    decryptionPvk: fs.readFileSync(__dirname + '/privateEncryption.pem', 'utf-8'),
    // IdP Public Signing Key
    cert: fs.readFileSync(__dirname + '/publicKey.crt', 'utf-8'),
    issuer: 'my-saml'
  },
  // hapi-passport-saml settings
  config: {
    // Service Provider Public Signing Key *Required if privateCert is provided
    signingCert: fs.readFileSync(__dirname + '/publicKey.crt', 'utf-8'),
    // Service Provider Public Encryption Key *Required if decryptionPvk is provided
    decryptionCert: fs.readFileSync(__dirname + '/publicKey.crt', 'utf-8'),
    // Plugin Routes
    routes: {
      // SAML Metadata
      metadata: {
        path: '/api/sso/v1/metadata.xml',
      },
      // SAML Assertion
      assert: {
        path: '/api/sso/v1/assert',
      },
    },
    assertHooks: {
      // Assertion Response Hook
      // Use this to add any specific props for your business
      // or appending to existing cookie
      // or make use of the RelayState
      onResponse: (profile, request, h) => {
        if(request.payload.RelayState)
          return h.redirect(request.payload.RelayState);
        else
          return h.response();
      },
    }
  }
};

const serverPlugins = [{
  register: require('hapi-passport-saml'),
  options: samlOptions,
}];

// Internal cookie settings
const schemeOpts = {
  password: '14523695874159852035.0',
  isSecure: false,
  isHttpOnly: false,
  ttl: 3600,
};
server.register(serverPlugins, function (err) {
  server.auth.strategy('single-sign-on', 'saml', schemeOpts);
  server.register(controllers, {
    routes: {
      prefix: '/api'
    }
  }, function () {
    if (!module.parent) {
      server.start(function () {
        console.log('Server started at port ' + server.info.port);
      });
    }
  });

});
```

>Note: Internal cookie name is `hapi-passport-saml-cookie`, if you need to read the SAML credentials for integration with other strategies, use assertion hook.

## Multiple strategies

Use `hapi-passport-saml` as the last strategy. Tested with `try` and `required` modes.

* `required`: If successful, returns credentials, else HTTP 200 with JSON
* `try`: If successful, returns credentials, else empty credentials and isAuthenticated set to false

More info: [Integrating hapi cookie with hapi passport saml v1.1.0
](https://gist.github.com/molekilla/a7a899a3b3d7cbf2ae89998606102330)

## Demo application

[Demo](https://github.com/molekilla/hapi-passport-saml-test)

## References, Ideas and Based from
* [Saml2](https://github.com/Clever/saml2)
* [Passport-saml](https://github.com/bergie/passport-saml)

## License
MIT
