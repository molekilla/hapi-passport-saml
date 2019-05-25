import { HapiSamlOptions } from './HapiSamlOptions';
const saml = require('passport-saml/lib/passport-saml/saml');
export class HapiSaml {
    private saml: any;
    public props: any;
    constructor(options: HapiSamlOptions) {
        this.saml = null;
        this.props = {};
        this.load(options);
    }

    load(options: HapiSamlOptions) {
        if (!options.saml) {
            throw new Error('Missing options.saml');
        }
        if (!options.config && !options.config.routes) {
            throw new Error('Missing options.config.routes');
        }
        if (!options.config.routes.metadata) {
            throw new Error('Missing options.config.routes.metadata');
        }
        if (!options.config.routes.assert) {
            throw new Error('Missing options.config.routes.assert');
        }
        if (!options.config && !options.config.assertHooks.onRequest) {
            throw new Error('Missing options.config.assertHooks.onRequest');
        }
        if (!options.config && !options.config.assertHooks.onResponse) {
            throw new Error('Missing options.config.assertHooks.onResponse');
        }
        this.saml = new saml.SAML(options.saml);
        this.props = { ...options.saml };
        this.props.decryptionCert = options.config.decryptionCert;
        this.props.signingCert = options.config.signingCert;
    }

    getSamlLib() {
        return this.saml;
    }
}
