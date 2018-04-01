/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   xhr-simple-request.html
 */

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../events-target-behavior/events-target-behavior.d.ts" />
/// <reference path="xhr-simple-request-transport.d.ts" />

declare namespace TransportElements {

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
   * - id (`String`) - Request incomming ID
   * - request (`Object`) - Original request object from `api-request` event
   * - loadingTime (`Number`) - High precise timing used by the performance API
   * - isError (`Boolean`) - Indicates if the request is errored
   * - error (`Error|undefined`) - Error object
   * - response (`Object`) - The response data:
   *  - status (`Number`) - Response status code
   *  - statusText (`String`) - Response status text. Can be empty string.
   *  - body (`String|Document|ArrayBuffer|Blob`) - Response body
   *  - headers (`String|undefined`) - Response headers
   *
   * Please note that aborting the request always sends `api-response` event
   * with `isError` set to true.
   */
  class XhrSimpleRequest extends
    ArcBehaviors.EventsTargetBehavior(
    Polymer.Element) {

    /**
     * Map of active request objects.
     * Keys in the map is request ID and vaue is instance of
     * `XhrSimpleRequestTransport`
     */
    activeRequests: Map<String|null, XhrSimpleRequestTransport|null>;

    /**
     * True while loading latest started requests.
     */
    readonly loading: boolean|null|undefined;

    /**
     * Latest used request object.
     */
    readonly lastRequest: XhrSimpleRequestTransport|null;
    _attachListeners(node: any): void;
    _detachListeners(node: any): void;
    ready(): void;

    /**
     * Handles for the `api-request` custom event. Transports the request.
     */
    _requestHandler(e: CustomEvent|null): void;
    _aborthHandler(e: any): void;

    /**
     * Creates a detail object for `api-response` cutom event
     *
     * @param request Request object
     * @param id Request original ID
     * @returns The value of the `detail` property.
     */
    _createDetail(request: XhrSimpleRequestTransport|null, id: String|null): object|null;

    /**
     * Handles response from the transport.
     *
     * @param id Request ID
     */
    _responseHandler(id: String|null): void;

    /**
     * Handles transport error
     *
     * @param err Transport error object.
     * @param id Request ID
     */
    _erroreHandler(err: object|null, id: String|null): void;

    /**
     * Dispatches `api-response` custom event.
     *
     * @param detail Request and response data.
     */
    _notifyResponse(detail: object|null): void;

    /**
     * Removes request from active requests.
     *
     * @param id Request ID.
     */
    _discardRequest(id: String|null): void;
  }
}

interface HTMLElementTagNameMap {
  "xhr-simple-request": TransportElements.XhrSimpleRequest;
}
