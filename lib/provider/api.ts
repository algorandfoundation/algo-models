import {encode} from 'cbor-x'
import {IARC0001Transaction} from "./types";
import {RequestMessageBuilder} from "./models/request.message.js";
import {SignTransactionsParamsBuilder} from "./models/sign.transactions.params.js";
import {SignTransactionsResultBuilder} from "./models/sign.transactions.result.js";
import {ResponseMessageBuilder} from "./models/response.message.js";

const LARGE_MESSAGE_SIZE = 255_000;
const LARGE_MESSAGE_ERROR = `Message too large, maximum is ${LARGE_MESSAGE_SIZE} in length`

const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const INVALID_BASE64URL_INPUT = 'Invalid base64url input';


/**
 * Bytes to Base64URL
 * @param {Uint8Array| ArrayBuffer} arr Bytes to convert to URL safe Base64
 */
export function toBase64URL(arr: Uint8Array | ArrayBuffer): string {
  const bytes = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
  const len = bytes.length;
  let base64 = '';
  for (let i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += chars[bytes[i + 2] & 63];
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1);
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2);
  }

  return base64;
}

/**
 * Base64URL to Bytes
 * @param {string} base64url URL safe Base64 string
 */
export function fromBase64Url(base64url: string): Uint8Array {
  if (typeof base64url !== 'string') {
    throw new Error(INVALID_BASE64URL_INPUT);
  }
  return new Uint8Array(
      // TODO: Cross-platform solution since atob is deprecated in Node
      atob(base64url.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''))
          .split('')
          .map((c) => c.charCodeAt(0)),
  );
}

export function toSignTransactionsParamsRequestMessage(messageId: string, providerId: string, txns: IARC0001Transaction[]): string {
  const signParams = new SignTransactionsParamsBuilder()
      .addProviderId(providerId)
      .addTxns(txns)
      .get()
  const request = new RequestMessageBuilder(messageId, "arc0027:sign_transactions:request")
      .addParams(signParams)
      .get()
  const encoded = encode(request)
  if(encoded.length > LARGE_MESSAGE_SIZE){
    throw new Error(LARGE_MESSAGE_ERROR)
  }
  return toBase64URL(encoded)
}

export function toSignTransactionsResultResponseMessage(messageId: string, providerId: string, requestId: string, stxns: string[]): string {
  const signResult = new SignTransactionsResultBuilder()
      .addProviderId(providerId)
      .addSignedTxns(stxns)
      .get()
  const request = new ResponseMessageBuilder(messageId,requestId, "arc0027:sign_message:response")
      .addResult(signResult)
      .get()
  const encoded = encode(request)
  if(encoded.length > LARGE_MESSAGE_SIZE){
    throw new Error(LARGE_MESSAGE_ERROR)
  }
  return toBase64URL(encoded)
}
