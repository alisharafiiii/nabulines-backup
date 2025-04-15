declare module 'oauth-1.0a' {
  interface Consumer {
    key: string;
    secret: string;
  }

  interface Token {
    key: string;
    secret: string;
  }

  interface OAuthOptions {
    consumer: Consumer;
    signature_method?: string;
    hash_function?: (base_string: string, key: string) => string;
  }

  class OAuth {
    constructor(options: OAuthOptions);
    authorize(request_data: {
      url: string;
      method: string;
      data?: Record<string, string>;
    }, token?: Token): {
      oauth_consumer_key: string;
      oauth_nonce: string;
      oauth_signature: string;
      oauth_signature_method: string;
      oauth_timestamp: string;
      oauth_version: string;
      oauth_token?: string;
    };
    toHeader(authorization: Record<string, string>): Record<string, string>;
  }

  export = OAuth;
} 