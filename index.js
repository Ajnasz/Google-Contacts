var EventEmitter = require('events').EventEmitter;
var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;

var Contacts = function(conf) {
  var contacts = this;
	this.conf = conf || {};
  this.googleAuth = new GoogleClientLogin(this.conf);
  this.googleAuth.on('error', function () {
    console.log('an error occured on auth');
    ;
  });
  this.googleAuth.login();
  this.googleAuth.on('login',function() {
    contacts.loggedIn = true;
  });
  this.client =  require('https');
  this.on('error', function () {
    console.log('error occured in googlecontacts');
  });
};
Contacts.prototype = new events.EventEmitter();
Contacts.prototype.getContacts = function() {
  var contacts = this;
  if(!contacts.loggedIn) {
    this.googleAuth.on('login',function() {
      console.log('on login');
      contacts._getContacts();
    });
    this.googleAuth.on('loginFailed',function() {
      console.log('login failed', this.conf);
    });
  } else {
    contacts._getContacts();
  }
}
Contacts.prototype._getContacts = function() {
  var contacts = this;
  var request = this.client.request(
    {
      host: 'www.google.com',
      port: 443,
      path: '/m8/feeds/contacts/default/full?max-results=3000&alt=json',
      method: 'GET',
      headers: {
        'Authorization': 'GoogleLogin auth=' + this.googleAuth.getAuthId()
      }
    },
    function(response) {
      var resp = '';

      response.on('data', function(data) {
        resp += data;
      });

      response.on('error', function (e) {
        console.log('an error occured getting contacts', e);
      });

      response.on('end', function() {
        console.log('erpons end');
        if(response.statusCode >= 200 && response.statusCode < 300) {
          contacts.contacts = JSON.parse(resp);
          contacts.emit('contactsReceived');
        } else {
          console.log('data: ' + resp);
        }
      });
  });
  request.end();
};
exports.Contacts = Contacts;
