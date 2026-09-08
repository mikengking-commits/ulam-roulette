// Copy this file to `firebase-config.js` and paste in your own project's values.
//
// Firebase Console -> Project settings -> General -> Your apps -> Web app -> SDK setup.
//
// These values are NOT secret. Firebase web config is public by design in every
// client-side app — anyone can read it out of the shipped JavaScript. Your data is
// protected by `firestore.rules`, not by hiding this file. That is why the real
// firebase-config.js is gitignored for tidiness rather than for security: if it
// ever did get committed, nothing is compromised.
//
// With no firebase-config.js present the app still runs. The meal log falls back to
// this browser's own storage and the add-a-dish button is hidden. That is a valid
// state, not a broken one — useful for opening the app on a machine you don't own.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
