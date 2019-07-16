'use strict';

const fs = require('fs');
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();

const { init } = require('./test_rig/index');
const plugin = require('../lib');

describe('Plugin', () => {
    let server;

    beforeEach(async() => {
        server = await init();
    });

    afterEach(async() => {
        await server.stop();
    });

    it('add RelayState query param to ', async() => {

        const samlOptions = {
            // passport saml settings
            saml: {
                callbackUrl: 'http://localhost:3000/sso/acs',
                entryPoint: 'https://idp.domain.com/',
                // Service Provider Private Signing Key
                privateCert: fs.readFileSync(__dirname + '/test_rig/cert/sp.key', 'utf-8'),
                // Service Provider Private Encryption Key
                decryptionPvk: fs.readFileSync(__dirname + '/test_rig/cert/sp.key', 'utf-8'),
                // IdP Public Signing Key
                cert: fs.readFileSync(__dirname + '/test_rig/cert/idp.pem', 'utf-8'),
                signatureAlgorithm: 'sha512',
                issuer: 'test-issuer'
            },
            // hapi-passport-saml settings
            config: {
                // Service Provider Public Signing Key *Required if privateCert is provided
                signingCert: fs.readFileSync(__dirname + '/test_rig/cert/sp.pem', 'utf-8'),
                // Service Provider Public Encryption Key *Required if decryptionPvk is provided
                decryptionCert: fs.readFileSync(__dirname + '/test_rig/cert/sp.pem', 'utf-8'),
                // Plugin Routes
                routes: {
                    // SAML Metadata
                    metadata: {
                        path: '/sso/saml/metadata.xml',
                    },
                    // SAML Assertion
                    assert: {
                        path: '/sso/acs',
                    },
                },
                assertHooks: {
                    // Assertion Response Hook
                    // Use this to add any specific props for your business
                    // or appending to existing cookie
                    // or make use of the RelayState
                    onResponse: (profile, request, h) => {
                        if (request.payload.RelayState) {
                            return h.redirect(request.payload.RelayState);
                        } else {
                            return h.response();
                        }
                    },
                }
            }
        };

        // Internal cookie settings
        const schemeOpts = {
            password: 'azdamoj32423ràçi]@^ffkjhsd:fjsh:d!sdjkhn{[[435345sdkdjhqs xd',
            isSecure: false,
            isHttpOnly: false
        };
        await server.register([
            {
                plugin: plugin,
                options: samlOptions
            }]);

        await server.auth.strategy('single-sign-on', 'saml', schemeOpts);
        await server.auth.default('single-sign-on');

        const res = await server.inject({
            method: 'get',
            url: '/'
        });

        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.searchParams.has('RelayState'), 'has RelayState query param').to.be.true();
        expect(res.headers.location.searchParams.has('SAMLRequest'),'has SAMLRequest query param').to.be.true();

    });


});
