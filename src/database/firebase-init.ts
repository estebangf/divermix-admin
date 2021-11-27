// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBskZ9HmAUWghXqiYFFjVanayHbkWHPLGM",
  authDomain: "divermix.firebaseapp.com",
  projectId: "divermix",
  storageBucket: "divermix.appspot.com",
  messagingSenderId: "925520992414",
  appId: "1:925520992414:web:c285354bb4c5e8576d838f",
  measurementId: "G-702RWM7705"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app)
const analytics = getAnalytics(app);

export const vapidKey = "BEGajGl8U8Z11FUsVIEMx-Pmj2aPdLdRydqp1v5spH-GaoexjbwSaDTocyeVoSqVkFW36PzfJAC2d3x7JJGf-wo"
export const messaging = getMessaging();

export default app