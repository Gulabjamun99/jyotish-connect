const admin = require('firebase-admin');

// ⚠️ WARNING: Run this locally with your service-account.json
// or use the Firebase Emulator if you don't have admin creds.

// Since we can't easily run admin SDK without a key file, 
// this script is designed to be run manually by the developer
// if they have the key.
//
// HOWEVER, for a "Free Tier" quick fix, we can output the JSON 
// and tell the user to import it, OR use the client-side SDK in a
// secret hidden page to seed the data.

console.log("To seed data, please visit the secret route: /en/test-firebase");
console.log("This is safer than exposing Admin keys.");
