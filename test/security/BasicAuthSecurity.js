// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// @ts-check
"use strict";

describe("BasicAuthSecurity", function () {
  var BasicAuthSecurity = require("../../").BasicAuthSecurity;
  var username = "admin";
  var password = "password1234";

  it("is a function", function () {
    BasicAuthSecurity.should.be.type("function");
  });

  describe("defaultOption param", function () {
    it("is accepted as the third param", function () {
      new BasicAuthSecurity(username, password, {});
    });

    it("is used in addOptions", function () {
      var options = {};
      var defaultOptions = { foo: 3 };
      var instance = new BasicAuthSecurity(username, password, defaultOptions);
      instance.addOptions(options);
      options.should.have.property("foo", 3);
    });
  });
});
