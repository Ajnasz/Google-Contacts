/*jslint node: true*/
var IniReader = require('inireader').IniReader;
var iniReader = new IniReader();
var module = require('../index');
var GoogleContacts = module.GoogleContacts;
var assert = require('assert');
var concatsTested = false, groupsTested = false;
iniReader.on('fileParse', function () {
	"use strict";

	var cfg = this.param('account'), c,
		contactGroupsStream, contactsStream, contactStream;
	c = new GoogleContacts({
		email: cfg.email,
		password: cfg.password
	});
	// testing buildpath
	assert.throws(function () {
		c.buildPath();
	});
	assert.equal(c.buildPath('groups'), '/m8/feeds/groups/default/thin?alt=json');
	assert.equal(c.buildPath('contacts'), '/m8/feeds/contacts/default/thin?alt=json');
	assert.throws(function () {
		c.buildPath('somethingelse');
	});
	assert.throws(function () {
		c.buildPath(null, {projection: 'full'});
	});

	c.on('error', function (e) {
		console.log('error', e);
	});
	c.on('contactsReceived', function (contacts) {
		assert.ok(typeof contacts === 'object', 'Contacts is not an object');
		concatsTested = true;
	});
	c.on('contactGroupsReceived', function (contactGroups) {
		assert.ok(typeof contactGroups === 'object', 'Contact groups is not an object');
		groupsTested = true;
	});

	c.getContacts();
	c.getContactGroups();

	contactGroupsStream = new module.GoogleContactsGroupsStream({
		email: cfg.email,
		password: cfg.password
	});

	contactStream = new module.GoogleContactStream({
		email: cfg.email,
		password: cfg.password,
		contactId: cfg.test_contact_id
	});

	contactsStream = new module.GoogleContactsStream({
		email: cfg.email,
		password: cfg.password
	});

	contactGroupsStream.on('data', function (chunk) {
		var data = JSON.parse(chunk);

		assert.ok(data.category[0].scheme, 'http://schemas.google.com/g/2005#kind');
		assert.ok(data.category[0].term, 'http://schemas.google.com/contact/2008#group');
	});

	contactStream.on('data', function (chunk) {
		var data = JSON.parse(chunk);
		assert.ok(data.category[0].scheme, 'http://schemas.google.com/g/2005#kind');
		assert.ok(data.category[0].term, 'http://schemas.google.com/contact/2008#contact');
		assert.ok(data.xmlns$gContact, 'http://schemas.google.com/contact/2008');
	});

	contactsStream.on('data', function (chunk) {
		var data = JSON.parse(chunk);
		assert.ok(data.category[0].scheme, 'http://schemas.google.com/g/2005#kind');
		assert.ok(data.category[0].term, 'http://schemas.google.com/contact/2008#contact');
	});
});

iniReader.load('/home/ajnasz/.google.ini');

process.on('exit', function () {
	"use strict";

	if (!concatsTested) {
		throw new Error('contact test failed');
	}

	if (!groupsTested) {
		throw new Error('group test failed');
	}
});
