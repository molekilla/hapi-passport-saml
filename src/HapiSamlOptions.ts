export interface HapiSamlOptionConfig {
    cookieName: string;

    routes: any;
    assertHooks: {
        onRequest: (i: string) => string;
        onResponse: (i: string) => string;
    };
}
export interface HapiSamlOptions {
    routes: string;
    decryptionCert: string;
    saml: any;
    config: HapiSamlOptionConfig;
}