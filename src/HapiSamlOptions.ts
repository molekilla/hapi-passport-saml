export interface HapiSamlOptionConfig {
    decryptionCert: string;
    signingCert: string;
    cookieSamlCredentialPropKey?: string | undefined | null;
    // cookieName?: string | undefined | null;

    routes: {
        metadata: any;
        assert: any;
    };
    assertHooks: {
        onRequest: (i: string) => void;
        onResponse: (i: string) => string;
    };
}
export interface HapiSamlOptions {
    saml: any;
    config: HapiSamlOptionConfig;
}
