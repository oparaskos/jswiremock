var jswiremocklib, jswiremock, stubFor, get, post, urlEqualTo, aResponse;
jswiremocklib = require('../jswiremock'), jswiremock = jswiremocklib.jswiremock, stubFor = jswiremocklib.stubFor, get = jswiremocklib.get, post = jswiremocklib.post, urlEqualTo = jswiremocklib.urlEqualTo, aResponse = jswiremocklib.aResponse, stopJSWireMock = jswiremocklib.stopJSWireMock;


/*
* Actual call to the stub below.
*/
var request = require("request");
var expect = require('chai').expect;

var WIREMOCK_PORT = 5001;

describe('stubFor', function () {
    var methods = [
        "GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"
    ];

    var mockServer;

    before(function () {
        mockServer = new jswiremock(WIREMOCK_PORT);
        for (var i = 0; i < methods.length; ++i) {
            var method = methods[i];
            var request = jswiremocklib[method.toLowerCase()];
            // With no expected body
            stubFor(mockServer, request(urlEqualTo("/no_expected_body/" + method))
                .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader({ "Content-Type": "application/json" })
                    .withBody("{\"status\":\"success\"}")));

            // With no expected body
            stubFor(mockServer, request(urlEqualTo("/expected_body/" + method),
                { field: "value" })
                .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader({ "Content-Type": "application/json" })
                    .withBody("{\"status\":\"success\"}")));
        }

    });

    after(function () {
        mockServer.stopJSWireMock();
    });

    for (var i = 0; i < methods.length; ++i) {
        var method = methods[i];
        describe(method, function () {
            it('should return the mocked page', function (done) {
                request({
                    uri: "http://localhost:" + WIREMOCK_PORT + "/no_expected_body/" + method,
                    method: method
                }, function (error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal("{\"status\":\"success\"}");
                    done();
                });
            });

            it('should return the mocked page for request with body', function (done) {
                request({
                    uri: "http://localhost:" + WIREMOCK_PORT + "/expected_body/" + method,
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ field: "value" })
                }, function (error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal("{\"status\":\"success\"}");
                    done();
                });
            });

            it('should 404 for an un-stubbed page', function (done) {
                request({
                    uri: "http://localhost:" + WIREMOCK_PORT + "/unstubbed-page/" + method,
                    method: method
                }, function (error, response, body) {
                    expect(response.statusCode).to.equal(404);
                    done();
                });
            });

            it('should 404 if the request body did not match the expected body', function (done) {
                request({
                    uri: "http://localhost:" + WIREMOCK_PORT + "/expected_body/" + method,
                    method: method,
                    body: JSON.stringify({field: "some_other_value"})
                }, function (error, response, body) {
                    expect(response.statusCode).to.equal(404);
                    done();
                });
            });
        });
    }
});
