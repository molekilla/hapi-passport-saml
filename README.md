# hapi-passport-saml
 A Hapi plugin that wraps passport-saml for SAML SSO (as SP)

## Current release
1.0.0

## Install

`npm install hapi-passport-saml`

## Configuration

Uses `samlidp.io` as IdP, read passport-saml for how to use options

```javascript
const idpCert = '...';
const decryptionCert = '...';
const samlOptions = {
  // passport saml settings
  saml: {
    callbackUrl: 'http://localhost/api/sso/v1/assert',
    logoutCallbackUrl: 'http://localhost/api/sso/v1/notifylogout',
    logoutUrl: 'https://my-idp.samlidp.io/saml2/idp/SingleLogoutService.php',
    host: 'localhost',
    protocol: 'http',
    entryPoint: 'https://my-idp.samlidp.io/saml2/idp/SSOService.php',
    // Service Provider Private Key
    decryptionPvk: fs.readFileSync(__dirname + '/private.key').toString(),
    // IdP Public Key
    cert: idpCert,
    issuer: 'my-saml'
  },
  // hapi-passport-saml settings
  config: {
    // cookie name to use
    cookieName: 'session',
    // Service Provider Public Key
    decryptionCert,
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
      onResponse: (profile) => {
        const username = profile['urn:oid:2.5.4.4'];
        return { ...profile, username };
      },
    }
  }
};

const serverPlugins = [{
  register: require('hapi-passport-saml'),
  options: samlOptions,
}];

const schemeOpts = {
  password: '14523695874159852035.0',
  isSecure: false,
  isHttpOnly: false,
  ttl: 3600,
  cookie: 'session',
}
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

### Cookies

* Add both `config.cookieName` and `schemeOpts.cookie` to use existing cookie. Leave empty if you want to use default cookie `hapi-passport-saml`.
* For scheme cookie options with cookie name, no other setting is used (plugin assumes application defined cookie options).
* Default SAML credentials prop is `profile`, to override use `config.cookieSamlCredentialPropKey`


## Demo application

[Demo](https://github.com/molekilla/hapi-passport-saml-test)

## References, Ideas and Based from
* [Saml2](https://github.com/Clever/saml2)
* [Passport-saml](https://github.com/bergie/passport-saml)

## License
MIT