/*jslint node: true*/
var IniReader = require('inireader').IniReader;
var iniReader = new IniReader();
var module = require('../index');
var GoogleContacts = module.GoogleContacts;
var assert = require('assert');
var concatsTested = false, groupsTested = false;
iniReader.on('fileParse', function () {
	"use strict";

	var cfg = this.param('account'), c;
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
});
iniReader.load('/home/ajnasz/.google.ini');
process.on('exit', function () {
	if (!concatsTested) {
		throw new Error('contact test failed');
	}

	if (!groupsTested) {
		throw new Error('group test failed');
	}
});
