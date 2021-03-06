/**
 * `xhr-simple-request`
 * A XHR request that works with API components.
 *
 * This is a copy of `iron-request` element from PolymerElements library but
 * adjusted to work with `API request` object (or ARC request object).
 *
 * It also handles custom events related to request flow.
 */
export class XhrSimpleRequestTransport {

  /**
   * A reference to the parsed response body, if the `xhr` has completely
   * resolved.
   */
  readonly response: any;

  /**
   * A reference to response headers, if the `xhr` has completely
   * resolved.
   */
  readonly headers: string;

  /**
   * A reference to the status code, if the `xhr` has completely resolved.
   */
  readonly status: number;
  readonly statusText: any;

  /**
   * A promise that resolves when the `xhr` response comes back, or rejects
   * if there is an error before the `xhr` completes.
   * The resolve callback is called with the original request as an argument.
   * By default, the reject callback is called with an `Error` as an argument.
   * If `rejectWithRequest` is true, the reject callback is called with an
   * object with two keys: `request`, the original request, and `error`, the
   * error object.
   */
  readonly completes: Promise<any>;

  /**
   * An object that contains progress information emitted by the XHR if
   * available.
   */
  readonly progress: object;

  /**
   * Aborted will be true if an abort of the request is attempted.
   */
  readonly aborted: boolean;

  /**
   * Errored will be true if the browser fired an error event from the
   * XHR object (mainly network errors).
   *    
   */
  readonly errored: any;

  /**
   * Aborted will be true if an abort of the request is attempted.
   *    
   */
  readonly timedOut: any;

  /**
   * Succeeded is true if the request succeeded. The request succeeded if it
   * loaded without error, wasn't aborted, and the status code is ≥ 200, and
   * < 300, or if the status code is 0.
   *
   * The status code 0 is accepted as a success because some schemes - e.g.
   * file:// - don't provide status codes.
   */
  readonly succeeded: boolean;

  /**
   * A reference to the XMLHttpRequest instance used to generate the
   * network request.
   */
  _xhr: XMLHttpRequest|null;

  /**
   * A reference to the parsed response body, if the `xhr` has completely
   * resolved.
   */
  _response: any;

  /**
   * A reference to response headers, if the `xhr` has completely
   * resolved.
   */
  _headers: String|null;

  /**
   * A reference to the status code, if the `xhr` has completely resolved.
   */
  _status: number;

  /**
   * A reference to the status text, if the `xhr` has completely resolved.
   */
  _statusText: string;

  /**
   * A promise that resolves when the `xhr` response comes back, or rejects
   * if there is an error before the `xhr` completes.
   * The resolve callback is called with the original request as an argument.
   * By default, the reject callback is called with an `Error` as an argument.
   * If `rejectWithRequest` is true, the reject callback is called with an
   * object with two keys: `request`, the original request, and `error`, the
   * error object.
   */
  _completes: Promise<any>|null;

  /**
   * An object that contains progress information emitted by the XHR if
   * available.
   */
  _progress: object;

  /**
   * Aborted will be true if an abort of the request is attempted.
   */
  _aborted: boolean;

  /**
   * Errored will be true if the browser fired an error event from the
   * XHR object (mainly network errors).
   */
  _errored: boolean;

  /**
   * TimedOut will be true if the XHR threw a timeout event.
   */
  _timedOut: boolean;

  /**
   * Appends headers to each request handled by this component.
   *
   * Example
   *
   * ```html
   * <xhr-simple-request
   *  append-headers="x-token: 123\nx-api-demo: true"></xhr-simple-request>
   * ```
   */
  appendHeaders: string;

  /**
   * If set every request made from the console will be proxied by the service provided in this
   * value.
   * It will prefix entered URL with the proxy value. so the call to
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/path/http://domain.com/path/?query=some+value`
   *
   * If the proxy require a to pass the URL as a query parameter define value as follows:
   * `https://proxy.com/path/?url=`. In this case be sure to set `proxy-encode-url`
   * attribute.
   */
  proxy: string;

  /**
   * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
   */
  proxyEncodeUrl: boolean;
  connectedCallback(): void;

  /**
   * Sends a request.
   *
   * @param options API request object
   * - url `String` The url to which the request is sent.
   * - method `(string|undefined)` The HTTP method to use, default is GET.
   * - payload `(ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object)`
   * The content for the request body for POST method.
   * - headers `String` HTTP request headers.
   * - withCredentials `(boolean|undefined)` Whether or not to send credentials on the request. Default is false.
   * - timeout `(Number|undefined)` Timeout for request, in milliseconds.
   * - id `String` Request ID
   */
  send(options: object): Promise<any>;

  /**
   * Applies headers to the XHR object.
   *
   * @param headers HTTP headers string
   */
  _applyHeaders(xhr: XMLHttpRequest, headers?: string): void;

  /**
   * Handler for the XHR `progress` event.
   * It sets `progress` property and dispatches `api-request-progress-changed`
   * custom event.
   */
  _progressHandler(progress: ProgressEvent): void;

  /**
   * Handler for XHR `error` event.
   */
  _errorHandler(): void;

  /**
   * Handler for XHR `timeout` event.
   */
  _timeoutHandler(): void;

  /**
   * Handler for XHR `abort` event.
   */
  _abortHandler(): void;

  /**
   * Handler for XHR `loadend` event.
   */
  _loadEndHandler(): void;

  /**
   * Aborts the request.
   */
  abort(): void;

  /**
   * Updates the status code and status text.
   */
  _updateStatus(): void;

  /**
   * Attempts to parse the response body of the XHR. If parsing succeeds,
   * the value returned will be deserialized based on the `responseType`
   * set on the XHR.
   *
   * TODO: The `responseType` will always be empty string because
   * send function does not sets the response type.
   * API request object does not support this property. However in the future
   * it may actually send this information extracted from the AMF model.
   * This function will be ready to handle this case.
   *
   * @returns The parsed response,
   * or undefined if there was an empty response or parsing failed.
   */
  parseResponse(): any;

  /**
   * Collects response headers string from the XHR object.
   */
  collectHeaders(): String;

  /**
   * Computes value for `_addHeaders` property.
   * A list of headers to add to each request.
   *
   * @param headers Headers string
   */
  _computeAddHeaders(headers: String|null): Array<object|null>;

  /**
   * Sets the proxy URL if the `proxy` property is set.
   *
   * @param url Request URL to alter if needed.
   * @returns The URL to use with request.
   */
  _appendProxy(url: String|null): String|null;
}

declare global {
  interface HTMLElementTagNameMap {
    "xhr-simple-request-transport": XhrSimpleRequestTransport;
  }
}
