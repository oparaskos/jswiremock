var express = require('express');
var bodyParser = require('body-parser');
var urlParser = require('./UrlParser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var METHODS = ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"];

exports.jswiremock = function (port) {
    server = app.listen(port);

    global.stubs = {
        "GET": [],
        "POST": [],
        "PUT": [],
        "DELETE": [],
        "PATCH": [],
        "OPTIONS": []
    };

    this.addStub = function (mockRequest) {
        var method = mockRequest.requestType.toUpperCase();
        if (METHODS.indexOf(method) === -1) {
            throw new Error("Unsupported method '" + method + "'"
                + ", please choose from "
                + "['" + METHODS.join("', '") + "']");
        }
        global.stubs[method].push(mockRequest);
    };

    this.stopJSWireMock = function () {
        server.close();
    };

    app.use('/*', function (req, res, next) {
        if (!res.headersSent) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', METHODS.join(', '));
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        }
        next();
    });

    function createRequestHandler(method) {
        return function (req, res) {
            var matchingStub = urlParser.hasMatchingStub(
                urlParser.buildUrlStorageLinkedList(req.originalUrl), stubs[method])

            if (matchingStub != null) {
                if (matchingStub.expectedBody) {
                    for (key in matchingStub.expectedBody) {
                        if (req.body[key] != null) {
                            if (req.body[key] === matchingStub.expectedBody[key]) {
                                continue;
                            }
                        } else {
                            res.status(404);
                            res.send("Does not exist, "
                                + "There are stubs matching this resource but the body does not match");
                            return;
                        }
                    }
                }

                for (var key in matchingStub.mockResponse.header) {
                    res.set(key, matchingStub.mockResponse.header[key]);
                }
                res.status(matchingStub.mockResponse.status);
                res.send(matchingStub.mockResponse.body);
            }
            else {
                res.status(404);
                res.send("Does not exist, "
                    + "There is no stub matching this resource");
                return;
            }
        }
    }

    for (var i = 0; i < METHODS.length; ++i) {
        app[METHODS[i].toLowerCase()]('/*', createRequestHandler(METHODS[i]));
    }

    return this;
};

exports.urlEqualTo = function (url) {
    var mockRequest = new MockRequest(url);
    return mockRequest;
};

function handlerFor(method) {
    return function (mockRequest, postParams) {
        return mockRequest
            .withRequestType(method)
            .withExpectedBody(postParams);
    };
}

for (var i = 0; i < METHODS.length; ++i) {
    exports[METHODS[i].toLowerCase()] = handlerFor(METHODS[i])
}

exports.withBody = function (expectedBody) {
    return expectedBody;
};

exports.stubFor = function (jsWireMock, mockRequest) {
    jsWireMock.addStub(mockRequest);
};

exports.aResponse = function () {
    return new MockResponse();
};

function MockRequest(url) {
    this.url = urlParser.buildUrlStorageLinkedList(url);
    this.mockResponse = null;
    this.requestType = null;
    this.expectedBody = null;

    this.withUrl = function (url) {
        this.url = url;
        return this;
    };
    this.withRequestType = function (requestType) {
        this.requestType = requestType;
        return this;
    };
    this.withExpectedBody = function (expectedBody) {
        this.expectedBody = expectedBody;
        return this;
    };

    this.willReturn = function (mockResponse) {
        this.mockResponse = mockResponse;
        return this;
    };
}

function MockResponse() {
    this.status = null;
    this.body = null;
    this.header = null;

    this.withStatus = function (status) {
        this.status = status;
        return this;
    };
    this.withBody = function (body) {
        this.body = body;
        return this;
    };
    this.withHeader = function (header) {
        this.header = header;
        return this;
    };
}
