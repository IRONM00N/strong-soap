// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// @ts-check
"use strict";

var Security = require("./security");

function hasCookieHeader(cookie) {
  return typeof cookie === "object" && cookie.hasOwnProperty("set-cookie");
}

/*
 * Accepts either a cookie or lastResponseHeaders
 */
class CookieSecurity extends Security {
  constructor(cookie, options) {
    super(options);

    cookie = hasCookieHeader(cookie) ? cookie["set-cookie"] : cookie;

    this.cookie = (Array.isArray(cookie) ? cookie : [cookie])
      .map((c) => c.split(";")[0])
      .join("; ");
  }

  addHttpHeaders(headers) {
    headers.Cookie = this.cookie;
  }
}

module.exports = CookieSecurity;
