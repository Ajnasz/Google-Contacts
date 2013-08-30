Class for Node.js (3.*) to download google contacts as json


How to use:

```js
var GoogleContacts = require('googlecontacts').GoogleContacts;
var c = new GoogleContacts({
    email: 'you@exmaple.com',
    password: 'password'
});
c.on('error', function (e) {
    console.log('error', e);
});
c.on('contactsReceived', function (contacts) {
    console.log('contacts: ' + contacts);
});
c.on('contactGroupsReceived', function (contactGroups) {
    console.log('groups: ' + contactGroups);
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

getContacts and getContactGroups has two optional parameter:
* projection
* any other parameter listed here: https://developers.google.com/google-apps/contacts/v3/reference#Projections

other functionallities coming soon..
