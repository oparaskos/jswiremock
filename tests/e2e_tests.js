var jswiremocklib, jswiremock, stubFor, get, post, urlEqualTo, aResponse;
jswiremocklib = require('../jswiremock'), jswiremock = jswiremocklib.jswiremock, stubFor = jswiremocklib.stubFor, get = jswiremocklib.get, post = jswiremocklib.post, urlEqualTo = jswiremocklib.urlEqualTo, aResponse = jswiremocklib.aResponse, stopJSWireMock = jswiremocklib.stopJSWireMock;

var jswiremock = new jswiremock(5001); //port

stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/delete/"))
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader({"Content-Type": "application/json"})
        .withBody("[{\"status\":\"success\"}]")));

stubFor(jswiremock, post(urlEqualTo("/login"), {username: "captainkirk", password: "enterprise"})
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader({})
        .withBody("")));

/*
 * Actual call to the stub below.
 */
var request = require("request");
var assert = require('assert');

request({
    uri: "http://localhost:5001/account/4444321/delete/",
    method: "GET"
}, function(error, response, body) {
    console.log("asdfasdfasdfasdf");
    console.log(body);
    assert.strictEqual(body, "[{\"status\":\"success\"}]", 'get response is not the same.');
    jswiremock.stopJSWireMock();
});
