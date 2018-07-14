export interface HapiSamlOptionConfig {
    decryptionCert: string;
    cookieName: string;

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