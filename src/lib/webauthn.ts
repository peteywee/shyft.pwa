// src/lib/webauthn.ts
/**
 * Decodes a base64url string into a Uint8Array.
 * @param {string} str The base64url string to decode.
 * @returns {Uint8Array} The decoded Uint8Array.
 */
function base64UrlToUint8Array(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a Uint8Array into a base64url string.
 * @param {Uint8Array} bytes The Uint8Array to encode.
 * @returns {string} The encoded base64url string.
 */
function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  const binaryString = String.fromCharCode.apply(null, Array.from(bytes));
  return btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * A type representing the public key credential object for future use.
 */
export interface PublicKeyCredentialFuture extends Omit<PublicKeyCredential, 'response'> {
  response: {
    clientDataJSON: string;
    attestationObject?: string;
    signature?: string;
    userHandle?: string;
  };
}

/**
 * A type representing a passkey.
 */
export interface Passkey {
  id: string;
  created: string;
  lastUsed: string;
}

const WEBAUTHN_API_URL = 'https://us-central1-iron-handler-460022-q7.cloudfunctions.net/ext-firebase-web-authn-api';

/**
 * Handles WebAuthn registration.
 * @param {string} email The user's email address.
 * @returns {Promise<{token: string}>} A promise that resolves with the authentication token.
 */
export async function webAuthnRegistration(email: string): Promise<{ token: string }> {
  const response = await fetch(WEBAUTHN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const options = await response.json();
  options.challenge = base64UrlToUint8Array(options.challenge);
  options.user.id = base64UrlToUint8Array(options.user.id);
  if (options.excludeCredentials) {
    options.excludeCredentials = options.excludeCredentials.map((c: any) => ({
      ...c,
      id: base64UrlToUint8Array(c.id),
    }));
  }

  const credential = (await navigator.credentials.create({
    publicKey: options,
  })) as PublicKeyCredential;

  const credentialForServer: PublicKeyCredentialFuture = {
    ...credential,
    response: {
      clientDataJSON: uint8ArrayToBase64Url(new Uint8Array(credential.response.clientDataJSON)),
      attestationObject: uint8ArrayToBase64Url(
        new Uint8Array((credential.response as any).attestationObject),
      ),
    },
  };

  const verificationResponse = await fetch(WEBAUTHN_API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentialForServer),
  });

  return verificationResponse.json();
}

/**
 * Handles WebAuthn assertion (signing in).
 * @returns {Promise<{token: string}>} A promise that resolves with the authentication token.
 */
export async function webAuthnAssertion(): Promise<{ token: string }> {
  const response = await fetch(WEBAUTHN_API_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  const options = await response.json();
  options.challenge = base64UrlToUint8Array(options.challenge);

  const credential = (await navigator.credentials.get({
    publicKey: options,
  })) as PublicKeyCredential;

  const credentialForServer: PublicKeyCredentialFuture = {
    ...credential,
    response: {
      clientDataJSON: uint8ArrayToBase64Url(new Uint8Array(credential.response.clientDataJSON)),
      signature: uint8ArrayToBase64Url(new Uint8Array((credential.response as any).signature)),
      userHandle: uint8ArrayToBase64Url(new Uint8Array((credential.response as any).userHandle)),
    },
  };

  const verificationResponse = await fetch(WEBAUTHN_API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentialForServer),
  });

  return verificationResponse.json();
}
