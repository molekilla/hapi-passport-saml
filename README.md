# hapi-passport-saml
 A Hapi plugin that wraps passport-saml for SAML SSO (as SP)

## Current release
1.0.0

## Install

`npm install hapi-passport-saml`

## Configuring Hapi server example

Uses samlidp.io as IdP, read passport-saml for how to use options

```javascript
const idpCert = '...';
const decryptionCert = '...';
const samlOptions = {
  saml: {
    callbackUrl: 'http://localhost:8080/api/sso/v1/assert',
    host: 'localhost',
    protocol: 'http',
    entryPoint: 'https://your-idp.samlidp.io/saml2/idp/SSOService.php',
    decryptionPvk: fs.readFileSync(__dirname + '/private.key').toString(),
    cert: idpCert,
    issuer: 'my-saml'
  },
  hapiSaml: {
    cookieName: 'session',
    decryptionCert,
    routes: {
      metadata: {
        path: '/api/sso/v1/metadata.xml',
        config: {
          description: 'metadata',
          notes: 'metadata',
          tags: ['api']
        }
      },
      assert: {
        path: '/api/sso/v1/assert',
        config: {
          description: 'assert',
          notes: 'assert',
          tags: ['api']
        }
      },
      initiateAuthentication: {
        path: '/api/sso/v1/login',
        config: {
          description: 'login',
          notes: 'login',
          tags: ['api']
        }
      },      
    },
    assertHooks: {
      onResponse: (profile) => {
        const username = profile['urn:oid:2.5.4.4'];
        return { ...profile, username };
      },
      onRequest: () => {}
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
  name: 'session',
  ttl: 3600,
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

## TODO

- Document logout
- Upload demo application

## References, Ideas and Based from
* [Saml2](https://github.com/Clever/saml2)
* [Passport-saml](https://github.com/bergie/passport-saml)

## License
MIT