Package.describe({
  summary: "Google-Contacts package",
  version: "0.3.0",
  git: "https://github.com/vitarch/Meteor-Google-Contacts.git",
  name: "vitarch:google-contacts"
});

Package.on_use(function (api) {
  api.add_files(['index.js'], 'server');
  if(api.export)
    api.export('GoogleContacts');

  if(api.versionsFrom){
    api.versionsFrom('METEOR@0.9.4');
  }
});

Npm.depends({
  "underscore": "1.5.2"
});
