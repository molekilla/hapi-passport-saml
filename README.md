# hapi-corpsso
A Hapi plugin that wraps passport-saml for SAML SSO (as SP)
with support for multiple strategies. This is a fork from hapi-passport-saml project (https://github.com/molekilla/hapi-passport-saml)

**Version 2.x.X is compatible with Hapi 18. For previous version, stay with 1.x.x**

## Current release
2.2.1

## Install

`npm install @aeroline_1025/hapi-corpsso`

## Configuration

Uses `samlidp.io` as IdP, read passport-saml for how to use options

```javascript
const Hapi = require('hapi');
const saml = require('@aeroline_1025/hapi-corpsso');
const routes = require('./routes/');

const server = Hapi.Server({
  port,
});

const samlOptions = {
  // passport saml settings
  saml: {
    callbackUrl: 'http://localhost/api/sso/v1/assert',
    logoutCallbackUrl: 'http://localhost/api/sso/v1/notifylogout',
    logoutUrl: 'https://my-idp.samlidp.io/saml2/idp/SingleLogoutService.php',
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

// Internal cookie settings
const schemeOpts = {
  password: '14523695874159852035.0',
  isSecure: false,
  isHttpOnly: false,
  ttl: 3600,
};

(async function start() {
  try {
    await server.register([
      { plugin: saml, options: samlOptions },
    ]);

    await server.auth.strategy('corpsso', 'saml', schemeOpts);
    await server.auth.default('corpsso');
    await server.route(routes);
    await server.start();
    console.log(`Server listening on ${port}`);
  } catch (e) {
    server.stop();
    console.error('Server stopped due to an error', e);
  }
}());
```

>Note: Internal cookie name is `hapi-corpsso-cookie`, if you need to read the SAML credentials for integration with other strategies, use assertion hook.

## Multiple strategies

Use `corpsso` as the last strategy. Tested with `try` and `required` modes.

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
