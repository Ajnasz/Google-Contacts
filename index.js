/**
 * @todo: recursively send requests until all contacts are fetched
 *
 * @see https://developers.google.com/google-apps/contacts/v3/reference#ContactsFeed
 *
 * Note: The Contacts API has a hard limit to the number of results it can return at a 
 * time even if you explicitly request all possible results. If the requested feed has 
 * more fields than can be returned in a single response, the API truncates the feed and adds 
 * a "Next" link that allows you to request the rest of the response.
 */
var EventEmitter = require('events').EventEmitter;
var qs = require('querystring');
var util = require('util');
var querystring = require('querystring');
//var parser = new (require('xml2js').Parser)();

var contactsUrl = '/m8/feeds/contacts/',
      contactGroupsUrl = '/m8/feeds/groups/',
      typeContacts = 'contacts',
      typeGroups = 'groups',
      projectionFull = 'full',
      projectionThin = 'thin';

var GoogleContacts = function (conf) {
  var contacts = this;
  this.conf = conf || {};
  this.conf.service = 'contacts';
};

GoogleContacts.prototype = {};
util.inherits(GoogleContacts, EventEmitter);

GoogleContacts.prototype._onContactsReceived = function (response, data) {
  //@todo: oops, response is in XML.. figure out how to get JSON or
  //simply parse as xml
//console.log(data);
  //PARSE XML HERE!!
  //parser.parseString(data, function (err, contacts) {
    //if (err) throw err;
    //self.contacts = contacts;
    //self.emit('contactsReceived', contacts);
  //});
  this.contacts = JSON.parse(data);
  this.emit('contactsReceived', this.contacts);
};
GoogleContacts.prototype._onContactGroupsReceived = function (response, data) {
  this.contactGroups = JSON.parse(data);
  this.emit('contactGroupsReceived', this.contactGroups);
};
GoogleContacts.prototype._onResponse = function (request, response) {
  var data = '', finished = false;
  // Thats a hack, because the end event is not emitted, but close yes.
  // https://github.com/joyent/node/issues/728
  var onFinish = function () {
    if (!finished) {
      finished = true;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (request.path.indexOf(contactsUrl) === 0) {
          this._onContactsReceived(response, data);
        } else if (request.path.indexOf(contactGroupsUrl) === 0) {
          this._onContactGroupsReceived(response, data);
        }
      } else {
        //console.log(response);
        var error = new Error('Bad client request status: ' + response.statusCode);
        this.emit('error', error);
      }
    }
  }.bind(this);
  response.on('data', function (chunk) {
    //console.log(chunk.toString());
    data += chunk;
  });

  response.on('error', function (e) {
    this.emit('error', e);
  }.bind(this));

  response.on('close', onFinish);
  response.on('end', onFinish);
};
GoogleContacts.prototype._buildPath = function (type, params) {
  var path, request;
  params = params || {};
  params.alt = 'json';
  var projection = projectionThin;
  if (params.projection) {
    projection = params.projection;
    delete params.projection;
  }

  var email = 'default';
  path = type === typeGroups ? contactGroupsUrl : contactsUrl;
  path += email + '/' + projection + '?' + querystring.stringify(params);
  return path;
};
GoogleContacts.prototype._get = function (type, params) {
  var req = {
      host: 'www.google.com',
      port: 443,
      path: this._buildPath(type, params) + qs.stringify({ alt: 'json' }),
      method: 'GET',
      headers: {
        'Authorization': 'OAuth ' + this.conf.token 
      }
      
  };
  console.log(req)
  var request = require('https').request(req,
    function (response) {
      this._onResponse(request, response);
    }.bind(this)
  ).on('error', function (e) {
    console.log('error getting stuff', e);
  });
  request.end();
};
GoogleContacts.prototype.getContacts = function (params) {
  this._get(typeContacts, params);
};
GoogleContacts.prototype.getContactGroups = function (projection, params) {
  this._get(typeGroups, params);
};
exports.GoogleContacts = GoogleContacts;
