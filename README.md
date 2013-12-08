Meteor wrapper for the Google Contacts API.

# Install

  mrt add google-contacts

# Usage

```javascript
opts =
        email: user.services.google.email
        consumerKey: Meteor.settings.knotable_google_id
        consumerSecret: Meteor.settings.knotable_google_secret
        token: user.services.google.accessToken
        refreshToken: user.services.google.refreshToken
gcontacts = new GoogleContacts opts
gcontacts.getContacts(function(err, contacts){
  // Do what you want to do with contacts
  // console.log(contacts);
});

gcontacts.getPhoto(contact.photoUrl, function(err, binaryData){
  // Save binaryData to you DB or file.
});
```