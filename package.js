Package.describe({
  summary: "Google-Contacts package",
  version: "0.2.0",
  git: "https://github.com/iyou/Meteor-Google-Contacts.git",
  name: "long:google-contacts"
});

Package.on_use(function (api) {
  api.add_files(['index.js'], 'server');
  if(api.export)
    api.export('GoogleContacts');

  if(api.versionsFrom){
    api.versionsFrom('METEOR@0.9.0');
  }
});

Npm.depends({
  "underscore": "1.5.2"
});
