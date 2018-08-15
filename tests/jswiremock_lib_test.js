var assert = require('assert');
var chai = require('chai');
chai.should();

var jswiremocklib, stubFor, get, urlEqualTo, aResponse;
jswiremocklib = require('../jswiremock'), stubFor = jswiremocklib.stubFor, get = jswiremocklib.get, urlEqualTo = jswiremocklib.urlEqualTo, aResponse = jswiremocklib.aResponse;

describe('jswiremock library', function() {
    describe('setup process', function() {
        it('should return a mock_request and mock_response object with the right info', function() {
            var mockRequest = get(urlEqualTo("/1"))
                                    .willReturn(aResponse()
                                        .withStatus(200)
                                        .withHeader({"Content-Type": "application/json"})
                                        .withBody("[{\"status\":\"success\", \"custom_audience_id\":\"12345\", \"lookalike_audience_id\": \"678999\"}]"));
            assert.equal(mockRequest.url.getData(), "1", "URL do not match");
            assert.equal(mockRequest.requestType, "GET");
            var mockResponse = mockRequest.mockResponse;
            assert.equal(mockResponse.status, 200);
            assert.equal(mockResponse.body, "[{\"status\":\"success\", \"custom_audience_id\":\"12345\", \"lookalike_audience_id\": \"678999\"}]");
            assert.deepEqual(mockResponse.header, {"Content-Type": "application/json"})
        });
    });
});