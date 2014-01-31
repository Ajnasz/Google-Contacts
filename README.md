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

gcontacts.refreshAccessToken opts.refreshToken, (err, accessToken) ->
  if err
    console.log 'gcontact.refreshToken, ', err
    return false
  else
    console.log 'gcontact.access token success!'
    gcontacts.token = accessToken
    gcontacts.getContacts (err, contacts) ->
      // Do what you want to do with contacts
      // console.log(contacts);

    gcontacts.getPhoto contact.photoUrl, (err, binaryData) ->
      // Save binaryData to you DB or file.
```
