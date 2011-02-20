/*jslint indent: 2 */
/*global console: true, require: true, exports */
var EventEmitter = require('events').EventEmitter;
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var util = require('util');
var querystring = require('querystring');

const contactsUrl = '/m8/feeds/contacts/',
      contactGroupsUrl = '/m8/feeds/groups/';

var GoogleContacts = function (conf) {
  var contacts = this;
  this.conf = conf || {};
  this.conf.service = 'contacts';
  this.googleAuth = new GoogleClientLogin(this.conf);
  this.googleAuth.on('error', function () {
    console.error('an error occured on auth');
  });
  this.googleAuth.on('login', function () {
    contacts.loggedIn = true;
  });
  this.client = require('https');
  this.googleAuth.login();
};
GoogleContacts.prototype = {};
util.inherits(GoogleContacts, EventEmitter);
GoogleContacts.prototype.getContacts = function (projection, limit) {
  var contacts = this;
  if (!contacts.loggedIn) {
    this.googleAuth.on('login', function () {
      contacts._getContacts(projection, limit);
    });
    this.googleAuth.on('loginFailed', function () {
      console.log('login failed', this.conf);
    });
  } else {
    contacts._getContacts(projection, limit);
  }
};
GoogleContacts.prototype.getContactGroups = function (projection, limit) {
  var contacts = this;
  if (!contacts.loggedIn) {
    this.googleAuth.on('login', function () {
      contacts._getContactGroups(projection, limit);
    });
    this.googleAuth.on('loginFailed', function () {
      console.log('login failed', this.conf);
    });
  } else {
    contacts._getContactGroups(projection, limit);
  }
};
GoogleContacts.prototype._onContactsReceived = function (response, data) {
    this.contacts = JSON.parse(data);
    this.emit('contactsReceived', this.contacts);
};
GoogleContacts.prototype._onContactGroupsReceived = function (response, data) {
    this.contactGroups = JSON.parse(data);
    this.emit('contactGroupsReceived', this.contactGroups);
};
GoogleContacts.prototype._onResponse = function (request, response) {
  var data = '';

  response.on('data', function (chunk) {
    data += chunk;
  });

  response.on('error', function (e) {
    this.emit('error', e);
  }.bind(this));

  response.on('end', function () {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (request.path.indexOf(contactsUrl) === 0) {
        this._onContactsReceived(response, data);
      } else if (request.path.indexOf(contactGroupsUrl) === 0) {
        this._onContactGroupsReceived(response, data);
      }
    } else {
      this.emit('error', 'Bad response status ' + data);
    }
  }.bind(this));
};
GoogleContacts.prototype._get = function (type, projection, limit) {
  var path, params, request;
  projection = projection || 'thin';
  params = {alt: 'json'};
  limit = parseInt(limit, 10);
  if (!isNaN(limit, 10)) {
    params['max-results'] = limit;
  }

  path = type === 'groups' ? contactGroupsUrl : contactsUrl;
  path += this.conf.email + '/' + projection + '?' + querystring.stringify(params);
  request = this.client.request(
    {
      host: 'www.google.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'GoogleLogin auth=' + this.googleAuth.getAuthId(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    function (response) {
      this._onResponse(request, response);
    }.bind(this)
  );
  request.end();
};
GoogleContacts.prototype._getContacts = function (projection, limit) {
  this._get('contacts', projection, limit);
};
GoogleContacts.prototype._getContactGroups = function (projection, limit) {
  this._get('groups', projection, limit);
};
exports.GoogleContacts = GoogleContacts;
