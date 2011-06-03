/*jslint indent:2*/
/*global require: true, console: true */
var IniReader = require('inireader').IniReader;
var iniReader = new IniReader();
var GoogleContacts = require('googlecontacts').GoogleContacts;
var assert = require('assert');
iniReader.on('fileParse', function () {
  var cfg = this.param('account'), c;
  c = new GoogleContacts({
    email: cfg.email,
    password: cfg.password
  });
  c.on('error', function (e) {
    console.log('error', e);
  });
  c.on('contactsReceived', function (contacts) {
    assert.ok(typeof contacts === 'object', 'Contacts is not an object');
    console.log('contacts tested');
  });
  c.on('contactGroupsReceived', function (contactGroups) {
    assert.ok(typeof contactGroups === 'object', 'Contact groups is not an object');
    console.log('groups tested');
  });
  c.getContacts();
  c.getContactGroups();
});
iniReader.load('/home/ajnasz/.google.ini');

