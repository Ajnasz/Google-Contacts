Meteor wrapper for the Google Contacts API.

# Install

  mrt add google-contacts

# Usage

```javascript
opts =
  email: userEmail
  consumerKey: googleId
  consumerSecret: googleSecret
  token: googleAccessToken
  refreshToken: googleRefreshToken

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
