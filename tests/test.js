/*jslint node: true*/
var IniReader = require('inireader').IniReader;
var iniReader = new IniReader();
var GoogleContacts = require('../index').GoogleContacts;
var assert = require('assert');
var concatsTested = false, groupsTested = false;
iniReader.on('fileParse', function () {
	var cfg = this.param('account'), c;
	c = new GoogleContacts({
		email: cfg.email,
		password: cfg.password
	});
	// testing buildpath
	assert.equal(c.buildPath(), '/m8/feeds/contacts/' + cfg.email + '/thin?alt=json');
	assert.equal(c.buildPath('groups'), '/m8/feeds/groups/' + cfg.email + '/thin?alt=json');
	assert.equal(c.buildPath('contacts'), '/m8/feeds/contacts/' + cfg.email + '/thin?alt=json');
	assert.equal(c.buildPath('somethingelse'),
			'/m8/feeds/contacts/' + cfg.email + '/thin?alt=json');
	assert.equal(c.buildPath(null, {projection: 'full'}),
			'/m8/feeds/contacts/' + cfg.email + '/full?alt=json');

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
