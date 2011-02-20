/*jslint indent: 2 */
/*global console: true, require: true, exports */
var EventEmitter = require('events').EventEmitter;
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;

var GoogleContacts = function (conf) {
  var contacts = this;
  this.conf = conf || {};
  this.googleAuth = new GoogleClientLogin(this.conf);
  this.googleAuth.on('error', function () {
    console.error('an error occured on auth');
  });
  this.googleAuth.on('login', function () {
    contacts.loggedIn = true;
  });
  this.client = require('https');
  this.on('error', function () {
    console.log('error occured in googlecontacts');
  });
  this.googleAuth.login();
};
GoogleContacts.prototype = new EventEmitter();
GoogleContacts.prototype.getContacts = function () {
  var contacts = this;
  if (!contacts.loggedIn) {
    this.googleAuth.on('login', function () {
      contacts._getContacts();
    });
    this.googleAuth.on('loginFailed', function () {
      console.log('login failed', this.conf);
    });
  } else {
    contacts._getContacts();
  }
};
GoogleContacts.prototype._onContactsReceived = function (response, resp) {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    this.contacts = JSON.parse(resp);
    this.emit('contactsReceived');
  } else {
    console.error('data: ', resp);
  }
};
GoogleContacts.prototype._getContacts = function () {
  var contacts = this, request, onEnd;

  request = this.client.request(
    {
      host: 'www.google.com',
      port: 443,
      path: '/m8/feeds/contacts/default/full?max-results=3000&alt=json',
      method: 'GET',
      headers: {
        'Authorization': 'GoogleLogin auth=' + this.googleAuth.getAuthId(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    function (response) {
      var resp = '';

      response.on('data', function (data) {
        resp += data;
      });

      response.on('error', function (e) {
        console.error('an error occured getting contacts', e);
      });

      response.on('end', this._onContactsReceived.bind(this));
    }
  );
  request.end();
};
exports.GoogleContacts = GoogleContacts;
