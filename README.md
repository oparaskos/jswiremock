# jswiremock
[![CircleCI](https://img.shields.io/circleci/project/github/oparaskos/jswiremock.svg?style=plastic)](https://circleci.com/gh/oparaskos/jswiremock)


Miss WireMock in Java? This is the Nodejs sibling to WireMock. At least that is the goal! 

Jswiremock is a flexible http api mocking library.

## Right now in v0.4.x:

- Simple requests can be mocked for GET, POST, PUT, PATCH, DELETE and OPTIONS.
- Fixed and Dynamic URL stubs (ex: /account/:varying_var/get/)
- Fixed and Dynamic Query parameters (ex: /account/234234?active=:var&cool=true
- Request body exact matching

## Installation
     $ npm i -s oparaskos-jswiremock

## How to use it?

```javascript
var jswiremocklib= require('../jswiremock');
var jswiremock = jswiremocklib.jswiremock;
var stubFor = jswiremocklib.stubFor;
var get = jswiremocklib.get;
var post = jswiremocklib.post;
var urlEqualTo = jswiremocklib.urlEqualTo;
var aResponse = jswiremocklib.aResponse;
var stopJSWireMock = jswiremocklib.stopJSWireMock;

var mockServer = new jswiremock(5001); //port

stubFor(mockServer, get(urlEqualTo("/account/:varying_var"))
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader({"Content-Type": "application/json"})
        .withBody("{\"status\":\"success\"}")));

stubFor(mockServer, post(urlEqualTo("/login"), {username: "captainkirk", password: "enterprise"})
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
    uri: "http://localhost:5001/account/4444321",
    method: "GET"
}, function(error, response, body) {
    assert.strictEqual(response.statusCode, 200, 'Status code matches withStatus');
    assert.strictEqual(body, "{\"status\":\"success\"}", 'Body matches withBody);
    mockServer.stopJSWireMock();
});
```

## Issues or new feature requests

Please feel free to use github's built-in issue tracking feature.
