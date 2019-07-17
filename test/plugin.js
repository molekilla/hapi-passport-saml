'use strict';

const fs = require('fs');
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it, before} = exports.lab = Lab.script();

const { init, serever } = require('./fixture/server');
const plugin = require('../lib');

describe('When not authenticated', () => {
    let server;

    before(async ()=>{

        const samlOptions = {
            // passport saml settings
            saml: {
                callbackUrl: 'http://localhost:3000/sso/acs',
                entryPoint: 'https://idp.domain.com/',
                // Service Provider Private Signing Key
                privateCert: fs.readFileSync(__dirname + '/fixture/cert/sp.key', 'utf-8'),
                // Service Provider Private Encryption Key
                decryptionPvk: fs.readFileSync(__dirname + '/fixture/cert/sp.key', 'utf-8'),
                // IdP Public Signing Key
                cert: fs.readFileSync(__dirname + '/fixture/cert/idp.pem', 'utf-8'),
                signatureAlgorithm: 'sha512',
                issuer: 'test-issuer'
            },
            // hapi-passport-saml settings
            config: {
                // Service Provider Public Signing Key *Required if privateCert is provided
                signingCert: fs.readFileSync(__dirname + '/fixture/cert/sp.pem', 'utf-8'),
                // Service Provider Public Encryption Key *Required if decryptionPvk is provided
                decryptionCert: fs.readFileSync(__dirname + '/fixture/cert/sp.pem', 'utf-8'),
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
        await serever.register([
            {
                plugin: plugin,
                options: samlOptions
            }]);

        await serever.auth.strategy('single-sign-on', 'saml', schemeOpts);
        await serever.auth.default('single-sign-on');
    });
    beforeEach(async() => {
        server = await init();
    });

    afterEach(async() => {
        await server.stop();
    });

    it('should redirect to IdP', async() => {
        const res = await server.inject({
            method: 'get',
            url: '/test'
        });

        //Parse the redirect location url
        const myUrl = new URL(res.headers.location);

        expect(res.statusCode).to.equal(302);
        expect(myUrl.hostname).to.equal('idp.domain.com');
    });

    it('should add a RelayState query param to redirect Url', async() => {
        const path = '/test';
         const res = await server.inject({
            method: 'get',
            url: path
        });

        //Parse the redirect location url
        const myUrl = new URL(res.headers.location);
        expect(myUrl.searchParams.has('RelayState'), 'has a RelayState query param').to.be.true();
        expect(myUrl.searchParams.get('RelayState'), 'set RelayState value').to.equal(path);
    });

    it('should add a SAMLRequest query param to redirect Url', async() => {

        const res = await server.inject({
            method: 'get',
            url: '/test'
        });

        //Parse the redirect location url
        const myUrl = new URL(res.headers.location);
        expect(myUrl.searchParams.has('SAMLRequest'),'has a SAMLRequest query param').to.be.true();

    });

});
