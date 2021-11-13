// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// @ts-check
"use strict";

var fs = require("fs"),
  join = require("path").join;
var XMLHandler = require("../../lib/parser/xmlHandler");

var passwordDigest = require("../../src/utils").passwordDigest;
var passwordDigestOriginal = require("../../src/utils").passwordDigestOriginal;

function createNonce(created) {
  var nHash = crypto.createHash("sha1");
  nHash.update(created + Math.random());
  return nHash.digest("base64");
}

describe("WSSecurity", function () {
  var WSSecurity = require("../../").WSSecurity;

  it("is a function", function () {
    WSSecurity.should.be.type("function");
  });

  it("should accept valid constructor variables", function () {
    var username = "myUser";
    var password = "myPass";
    var options = {
      passwordType: "PasswordText",
      hasNonce: true,
      actor: "urn:sample",
    };
    var instance = new WSSecurity(username, password, options);
    instance.should.have.property("_username", username);
    instance.should.have.property("_password", password);
    instance.should.have.property("_passwordType", options.passwordType);
    instance.should.have.property("_hasNonce", options.hasNonce);
    instance.should.have.property("_actor", options.actor);
  });

  it("should accept passwordType as 3rd arg", function () {
    var username = "myUser";
    var password = "myPass";
    var passwordType = "PasswordText";
    var instance = new WSSecurity(username, password, passwordType);
    instance.should.have.property("_username", username);
    instance.should.have.property("_password", password);
    instance.should.have.property("_passwordType", passwordType);
    instance.should.not.have.property("_hasNonce");
    instance.should.not.have.property("_actor");
  });

  it("should insert a WSSecurity when postProcess is called", function () {
    var env = XMLHandler.createSOAPEnvelope();
    var username = "myUser";
    var password = "myPass";
    var options = {
      passwordType: "PassWordText",
      hasNonce: true,
      actor: "urn:sample",
    };
    var instance = new WSSecurity(username, password, options);
    instance.addSoapHeaders(env.header);
    var xml = env.header.toString({ pretty: true });

    xml.should.containEql('<wsse:Security soap:actor="urn:sample" ');
    xml.should.containEql(
      'xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-secext-1.0.xsd"'
    );
    xml.should.containEql(
      'xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-utility-1.0.xsd">'
    );
    xml.should.containEql('<wsu:Timestamp wsu:Id="Timestamp-');
    xml.should.containEql("<wsu:Created>");
    xml.should.containEql("<wsu:Expires>");
    xml.should.containEql("</wsu:Timestamp>");
    xml.should.containEql("<wsse:UsernameToken ");
    xml.should.containEql(
      'xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-wssecurity-utility-1.0.xsd"'
    );
    xml.should.containEql('wsu:Id="SecurityToken-');
    xml.should.containEql("<wsse:Username>myUser</wsse:Username>");
    xml.should.containEql("<wsse:Password ");
    xml.should.containEql(
      'Type="http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-username-token-profile-1.0#PasswordText">'
    );
    xml.should.containEql("myPass</wsse:Password>");
    xml.should.containEql(
      "<wsse:Nonce " +
        'EncodingType="http://docs.oasis-open.org/wss/2004/01/' +
        'oasis-200401-wss-soap-message-security-1.0#Base64Binary">'
    );
    xml.should.containEql("</wsse:Nonce>");
    xml.should.containEql("<wsu:Created>");
    xml.should.containEql("</wsse:UsernameToken>");
    xml.should.containEql("</wsse:Security>");
  });

  it("test WSSecurity digest against SoapUI 5.4 output", function () {
    var username = "myUser";
    var password = "myPass";
    var created = "";
    var nonce = "";
    var digest = "";

    /**
       * example passwordDigest created using SoapUI version 5.4.0
       * UsernameToken generated by SoapUI with given username/password:
       
           <wsse:UsernameToken wsu:Id="UsernameToken-352AA58F91A6EDB0A815131026593483">
              <wsse:Username>myUser</wsse:Username>
              <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">yangN8zaHDO1j9wLGjwzWTaY/6o=</wsse:Password>
              <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">hdk9vWPwQ37Y5O2hICiOgQ==</wsse:Nonce>
              <wsu:Created>2017-12-12T18:17:39.348Z</wsu:Created>
           </wsse:UsernameToken>
  
       */
    created = "2017-12-12T18:17:39.348Z";
    nonce = "hdk9vWPwQ37Y5O2hICiOgQ==";
    digest = "yangN8zaHDO1j9wLGjwzWTaY/6o=";

    passwordDigest(nonce, created, password).should.containEql(digest);
  });

  it("test WSSecurity digest against Boomerang 3.4.1 output", function () {
    var username = "myUser";
    var password = "myPass";
    var created = "";
    var nonce = "";
    var digest = "";

    /**
       * example passwordDigest created using Boomerang 3.4.1
       * UsernameToken generated by boomerang with given username/password:
  https://chrome.google.com/webstore/detail/boomerang-soap-rest-clien/eipdnjedkpcnlmmdfdkgfpljanehloah/reviews
  
              <wsse:UsernameToken>
                  <wsse:Username>myUser</wsse:Username>
                  <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">5gHmXk5jplZPkcFFkvp0MBowUbg=</wsse:Password>
                  <wsse:Nonce>MTUxMzEwNDAyNDEwODAwMA==</wsse:Nonce>
                  <wsu:Created>2017-12-12T18:40:24.108Z</wsu:Created>
              </wsse:UsernameToken>
  
       */
    created = "2017-12-12T18:40:24.108Z";
    nonce = "MTUxMzEwNDAyNDEwODAwMA==";
    digest = "5gHmXk5jplZPkcFFkvp0MBowUbg=";

    passwordDigest(nonce, created, password).should.containEql(digest);
  });

  it("Original WSSecurity digest method failing against SoapUI 5.4 output", function () {
    var username = "myUser";
    var password = "myPass";
    var created = "";
    var nonce = "";
    var digest = "";

    /**
     * example passwordDigest created using SoapUI version 5.4.0
     * UsernameToken generated by SoapUI with given username/password:
     
         <wsse:UsernameToken wsu:Id="UsernameToken-352AA58F91A6EDB0A815131026593483">
            <wsse:Username>myUser</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">yangN8zaHDO1j9wLGjwzWTaY/6o=</wsse:Password>
            <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">hdk9vWPwQ37Y5O2hICiOgQ==</wsse:Nonce>
            <wsu:Created>2017-12-12T18:17:39.348Z</wsu:Created>
         </wsse:UsernameToken>

     */
    created = "2017-12-12T18:17:39.348Z";
    nonce = "hdk9vWPwQ37Y5O2hICiOgQ==";
    digest = "yangN8zaHDO1j9wLGjwzWTaY/6o=";

    passwordDigestOriginal(nonce, created, password).should.not.containEql(
      digest
    );
  });
});
