Class for Node.js to download google contacts as json


How to use:

```js
var GoogleContacts = require('googlecontacts').GoogleContacts,
    util = require('util');
var c = new GoogleContacts({
    email: 'you@exmaple.com',
    password: 'password'
});
c.on('error', function (e) {
    console.log('error', e);
});
c.on('contactsReceived', function (contacts) {
    console.log('contacts: ', util.inspect(contacts, {depth:null}));
});
c.on('contactGroupsReceived', function (contactGroups) {
    console.log('groups: ', util.inspect(contactGroups, {depth:null}));
});
c.getContacts({
    projection: 'thin',
    'max-results': 100
});
c.getContactGroups({
    projection: 'thin',
    'max-results': 200
});
```

`_getContacts()_` and `_getContactGroups()_` can get the following parameters:

* projection
* any other parameter listed here: https://developers.google.com/google-apps/contacts/v3/reference#Projections

other functionallities coming soon..


Contact Stream
--------------

You can handle contacts as streams.

```js
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


contactGroupsStream.pipe(process.stdout);
contactsStream.pipe(process.stdout);
contactStream.pipe(process.stdout);
```
