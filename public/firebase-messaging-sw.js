importScripts('https://divermix.web.app/__/firebase/9.2.0/firebase-app-compat.js');
importScripts('https://divermix.web.app/__/firebase/9.2.0/firebase-messaging-compat.js');
importScripts('https://divermix.web.app/__/firebase/init.js');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../firebase-messaging-sw.js')
    .then(function (registration) {
      console.log('Registration successful, scope is:', registration.scope);
    }).catch(function (err) {
      console.log('Service worker registration failed, error:', err);
    });
}

const initMessaging = firebase.messaging()

// initMessaging.onBackgroundMessage(function (payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   if (!!payload.data) {
//     const {
//       body,
//       title
//     } = payload.data
//     let icon = 'https://divermix.web.app/logo192.png'
//     // Customize notification here
//     const options = {
//       body,
//       icon
//     };

//     self.registration.showNotification(
//       title,
//       options
//     );
//   }
// });
