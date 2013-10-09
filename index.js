/*jslint node: true*/
var EventEmitter = require('events').EventEmitter;
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var util = require('util');
var querystring = require('querystring');
var url = require('url');

var contactsUrl = '/m8/feeds/contacts',
	contactGroupsUrl = '/m8/feeds/groups',
	contactUrl = '/m8/feeds/contacts',
	typeContacts = 'contacts',
	typeContact = 'contact',
	typeGroups = 'groups',
	projectionThin = 'thin';

function GoogleContacts(conf) {
	"use strict";

	this.conf = conf || {};
	this.conf.service = 'contacts';
}

GoogleContacts.prototype = {};

util.inherits(GoogleContacts, EventEmitter);

GoogleContacts.prototype.auth = function (cb) {
	"use strict";

	if (!this.googleAuth) {
		this.googleAuth = new GoogleClientLogin(this.conf);
		this.googleAuth.on('login', function () {
			this.isLoggedIn = true;
		}.bind(this));
	}
	if (!this.isLoggedIn) {
		this.googleAuth.on('login', function () {
			cb();
		}.bind(this));
		this.googleAuth.on('error', function () {
			this.emit('error', 'login failed');
		});
		this.googleAuth.login();
	} else {
		cb();
	}
};

GoogleContacts.prototype.getContact = function (params) {
	"use strict";

	this.auth(function () {
		this.requestContact(params);
	}.bind(this));
};

GoogleContacts.prototype.getContacts = function (params) {
	"use strict";

	this.auth(function () {
		this.requestContacts(params);
	}.bind(this));
};

GoogleContacts.prototype.getContactGroups = function (params) {
	"use strict";

	this.auth(function () {
		this.requestContactGroups(params);
	}.bind(this));
};

GoogleContacts.prototype.onContactsReceived = function (response, data) {
	"use strict";

	this.contacts = JSON.parse(data);
	this.emit('contactsReceived', this.contacts);
};

GoogleContacts.prototype.onContactReceived = function (response, data) {
	"use strict";

	this.contact = JSON.parse(data);
	this.emit('contactReceived', this.contact);
};

GoogleContacts.prototype.onContactGroupsReceived = function (response, data) {
	"use strict";

	this.contactGroups = JSON.parse(data);
	this.emit('contactGroupsReceived', this.contactGroups);
};

GoogleContacts.prototype.onResponse = function (type, response) {
	"use strict";

	var data = '', finished = false, onFinish;
	// Thats a hack, because the end event is not emitted, but close yes.
	// https://github.com/joyent/node/issues/728
	onFinish = function () {
		if (!finished) {
			finished = true;
			if (response.statusCode >= 200 && response.statusCode < 300) {
				if (type === typeContacts) {
					this.onContactsReceived(response, data);
				} else if (type === typeGroups) {
					this.onContactGroupsReceived(response, data);
				} else if (type === typeContact) {
					this.onContactReceived(response, data);
				}
			} else {
				var error = new Error('Bad response status: ' + response.statusCode);
				this.emit('error', error);
			}
		}
	}.bind(this);
	response.on('data', function (chunk) {
		data += chunk;
	});

	response.on('error', function (e) {
		this.emit('error', e);
	}.bind(this));

	response.on('close', onFinish);
	response.on('end', onFinish);
};

GoogleContacts.prototype.buildPath = function (type, params) {
	"use strict";

	var path, request, projection, pathItems, gUrl;
	params = params || {};
	pathItems = [];
	params.alt = 'json';
	projection = projectionThin;

	if (params.projection) {
		projection = params.projection;
		delete params.projection;
	}

	if (type === typeGroups) {
		gUrl = contactGroupsUrl;
	} else if (type === typeContacts) {
		gUrl = contactsUrl;
	} else if (type === typeContact) {
		gUrl = contactUrl;
	}

	pathItems.push(gUrl);
	pathItems.push('default');
	pathItems.push(projection);

	if (type === typeContact) {
		pathItems.push(this.conf.contactId);
	}

	path = url.format({
		pathname: url.resolve('/', pathItems.join('/')),
		search: '?' + querystring.stringify(params)

	});
	// path += this.conf.email + '/' + projection + '?' + querystring.stringify(params);
	return path;
};

GoogleContacts.prototype.get = function (type, params) {
	"use strict";

	var request, path;

	path = this.buildPath(type, params);

	request = require('https').request({
		host: 'www.google.com',
		port: 443,
		path: path,
		method: 'GET',
		headers: {
			'Authorization': 'GoogleLogin auth=' + this.googleAuth.getAuthId(),
			'GData-Version': '3.0'
		}
	}, function (response) {
		this.onResponse(type, response);
	}.bind(this)).on('error', function (e) {
		// console.log('error getting stuff', e);
	});
	request.end();
};

GoogleContacts.prototype.requestContacts = function (params) {
	"use strict";

	this.get(typeContacts, params);
};

GoogleContacts.prototype.requestContactGroups = function (params) {
	"use strict";

	this.get(typeGroups, params);
};

GoogleContacts.prototype.requestContact = function (params) {
	"use strict";

	this.get(typeContact, params);
};
