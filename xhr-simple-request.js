/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import './xhr-simple-request-transport.js';

/** @typedef {import('./xhr-simple-request-transport').XhrSimpleRequestTransport} XhrSimpleRequestTransport */

/**
 * `xhr-simple-request`
 * A XHR request that works with API components.
 *
 * It handles `api-request` and `abort-api-request` custom events that control
 * request flow in API components ecosystem.
 *
 * This makes a request by using `XMLHttpRequest` object.
 *
 * ## ARC request data model
 *
 * The `api-request` custom event has to contain ARC (Advanced REST client)
 * request data model. It expects the following properties:
 * - url (`String`) - Request URL
 * - method (`String`) - Request HTTP method.
 * - headers (`String|undefined`) - HTTP headers string
 * - payload (`String|FormData|File|ArrayBuffer|undefined`) Request body
 * - id (`String`) **required**, request id. It can be any string, it must be unique.
 *
 * Note, this library does not validates the values and use them as is.
 * Any error related to validation has to be handled by the application.
 *
 * ## api-response data model
 *
 * When response is ready the element dispatches `api-response` custom event
 * with following properties in the detail object.
 * - id (`String`) - Request incoming ID
 * - request (`Object`) - Original request object from `api-request` event
 * - loadingTime (`Number`) - High precise timing used by the performance API
 * - isError (`Boolean`) - Indicates if the request is error
 * - error (`Error|undefined`) - Error object
 * - response (`Object`) - The response data:
 *  - status (`Number`) - Response status code
 *  - statusText (`String`) - Response status text. Can be empty string.
 *  - payload (`String|Document|ArrayBuffer|Blob`) - Response body
 *  - headers (`String|undefined`) - Response headers
 *
 * Please note that aborting the request always sends `api-response` event
 * with `isError` set to true.
 */
class XhrSimpleRequest extends EventsTargetMixin(LitElement) {
  static get properties() {
    return {
      /**
       * Map of active request objects.
       * Keys in the map is the request ID and value is instance of the
       * `XhrSimpleRequestTransport`
       */
      activeRequests: { type: Object },
      /**
       * True while loading latest started requests.
       */
      _loading: { type: Boolean },
      /**
       * Latest used request object.
       */
      _lastRequest: { type: Object },
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
      appendHeaders: { type: String },
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
      proxy: { type: String },
      /**
       * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
       * `http://domain.com/path/?query=some+value` will become
       * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
       */
      proxyEncodeUrl: { type: Boolean }
    };
  }

  /**
   * True while loading latest started requests.
   *
   * @return {Boolean}
   */
  get loading() {
    return this._loading;
  }

  get _loading() {
    return this.__loading;
  }

  set _loading(value) {
    const old = this.__loading;
    if (old === value) {
      return;
    }
    this.__loading = old;
    this.dispatchEvent(new CustomEvent('loading-changed', {
      detail: {
        value
      }
    }));
  }

  get lastRequest() {
    return this._lastRequest;
  }

  get _lastRequest() {
    return this.__lastRequest;
  }

  set _lastRequest(value) {
    const old = this.__lastRequest;
    if (old === value) {
      return;
    }
    this.__lastRequest = old;
    this.dispatchEvent(new CustomEvent('lastrequest-changed', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();
    this._requestHandler = this._requestHandler.bind(this);
    this._abortHandler = this._abortHandler.bind(this);

    /**
     * @type {Map<String, XhrSimpleRequestTransport>}
     */
    this.activeRequests = new Map();
    /**
     * @type {string}
     */
    this.appendHeaders = undefined;
    /**
     * @type {string}
     */
    this.proxy = undefined;
    /**
     * @type {boolean}
     */
    this.proxyEncodeUrl = undefined;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.setAttribute('aria-hidden', 'true');
  }

  _attachListeners(node) {
    node.addEventListener('api-request', this._requestHandler);
    node.addEventListener('abort-api-request', this._abortHandler);
  }

  _detachListeners(node) {
    node.removeEventListener('api-request', this._requestHandler);
    node.removeEventListener('abort-api-request', this._abortHandler);
  }

  /**
   * Creates instance of transport object with current configuration.
   * @return {XhrSimpleRequestTransport}
   */
  _createRequest() {
    const request = document.createElement('xhr-simple-request-transport');
    request.appendHeaders = this.appendHeaders;
    request.proxy = this.proxy;
    request.proxyEncodeUrl = this.proxyEncodeUrl;
    return request;
  }

  /**
   * Handles for the `api-request` custom event. Transports the request.
   *
   * @param {CustomEvent} e
   */
  _requestHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const opts = e.detail;
    const request = this._createRequest();
    request.__opts = opts;
    this.activeRequests.set(opts.id, request);

    request._startTime = performance.now();
    request.completes
    .then(() => this._responseHandler(opts.id))
    .catch((error) => this._errorHandler(error, opts.id))
    .then(() => this._discardRequest(opts.id));
    request.send(opts);

    this._lastRequest = request;
    this._loading = true;
  }

  /**
   * Handler for `abort-api-request` event. Aborts the request and reports
   * error response.
   * It expects the event to have `id` property set on the detail object.
   * @param {CustomEvent} e
   */
  _abortHandler(e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { id } = e.detail;
    const request = this.activeRequests.get(id);
    if (!request) {
      return;
    }
    request.abort();
    // Error thrown by the abort event will clear the request.
  }

  /**
   * Creates a detail object for `api-response` custom event
   *
   * @param {XhrSimpleRequestTransport} request Request object
   * @param {string} id Request original ID
   * @return {Object} The value of the `detail` property.
   */
  _createDetail(request, id) {
    const loadingTime = performance.now() - request._startTime;
    const result = {
      id,
      request: request.__opts,
      response: {
        status: request.status,
        statusText: request.statusText,
        payload: request.response,
        headers: request.headers
      },
      loadingTime,
    };
    return result;
  }

  /**
   * Handles response from the transport.
   *
   * @param {string} id Request ID
   */
  _responseHandler(id) {
    this._loading = false;
    const request = this.activeRequests.get(id);
    const result = this._createDetail(request, id);
    result.isError = false;
    this._notifyResponse(result);
  }

  /**
   * Handles transport error
   *
   * @param {Object} err Transport error object.
   * @param {string} id Request ID
   */
  _errorHandler(err, id) {
    this._loading = false;
    let { error } = err;
    if (error instanceof ProgressEvent) {
      error = new Error('Unable to connect');
    }
    const request = this.activeRequests.get(id);
    const result = this._createDetail(request, id);
    result.isError = true;
    result.error = error;
    this._notifyResponse(result);
  }

  /**
   * Dispatches `api-response` custom event.
   *
   * @param {Object} detail Request and response data.
   */
  _notifyResponse(detail) {
    const e = new CustomEvent('api-response', {
      bubbles: true,
      composed: true,
      detail
    });
    this.dispatchEvent(e);
  }

  /**
   * Removes request from active requests.
   *
   * @param {String} id Request ID.
   */
  _discardRequest(id) {
    this.activeRequests.delete(id);
  }
  /**
   * @event api-response
   *
   * Dispatched when the response is ready.
   *
   * For list of parameters see element's documentation.
   */
}

window.customElements.define('xhr-simple-request', XhrSimpleRequest);
