import app, { db, auth, messaging, vapidKey } from "./firebase-init";

import { collection, query, where, orderBy, getDocs, addDoc, getDoc, doc, updateDoc, setDoc, onSnapshot, Timestamp, arrayUnion } from "firebase/firestore";
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import UserProfile, { UsersProfile } from "../models/UserProfile";
import Movement, { Movements } from "../models/Movement";
import Reservation, { Reservations } from "../models/Reservation";
import Notification, { Notifications } from '../models/Notifications';

import { getToken, onMessage } from "firebase/messaging";
import SnackNotification from "../models/SnackNotification";
import axios from "axios"
import priceFormat from "../tools/priceFormat";


export function getTokenUser() {
  getToken(messaging, { vapidKey }).then((currentToken) => {
    if (currentToken) {
      console.log("TOKEN => ", currentToken)
    } else {
      // Show permission request UI
      console.log('No registration token available. Request permission to generate one.');
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
  });
}

export function onMessageRecived(show: Function) {
  onMessage(messaging, (payload) => {
    console.log("Mensaje Recibido => ", payload)
    if (payload.data?.message) {
      let notification: SnackNotification = {
        message: payload.data.message,
        severity: payload.data.severity as "success" | "info" | "warning" | "error"
      }
      show(notification)
    } else if (payload.notification) {
      let notification: SnackNotification = {
        message: payload.notification.body as string,
        severity: "info"
      }
      show(notification)
    }
  });
}


export function initStatesApp(setUser: Function, setReady: Function) {
  onAuthStateChanged(auth, (userObserver) => {
    if (userObserver) {
      let refUserDoc = doc(db, "users", userObserver.uid)
      onSnapshot(refUserDoc, userDocSnapshot => {
        let userProfile: UserProfile = {
          displayName: userObserver.displayName,
          email: userObserver.email,
          emailVerified: userObserver.emailVerified,
          phoneNumber: userObserver.phoneNumber,
          photoURL: userObserver.photoURL,

          roles: []
        }
        if (userDocSnapshot.exists()) {
          userProfile = {
            ...userProfile,

            roles: userDocSnapshot.data().roles
          }
        }


        // userObserver.providerData.forEach(profile => {
        //   let providerProfile: UserProfile = {
        //     displayName: profile.displayName,
        //     email: profile.email,
        //     phoneNumber: profile.phoneNumber,
        //     photoURL: profile.photoURL,
        //     uid: profile.uid,
        //   }
        // })


        setUser(userProfile)
        setReady(true)
      })
    } else {
      setUser(undefined)
      setReady(true)
    }
  })
}


export function getCurrentUser() {
  return auth.currentUser
}


export function getMovement(idMovement: string) {
  return new Promise<Movement>((resolve, reject) => {
    let ref = doc(db, "movements", idMovement)
    getDoc(ref).then(documentSnapshot => {
      if (documentSnapshot.exists()) {
        let movement: Movement = {
          id: documentSnapshot.id,
          description: documentSnapshot.data().description,
          amount: documentSnapshot.data().amount,
          type: documentSnapshot.data().type,
          date: documentSnapshot.data().date,
          createdBy: documentSnapshot.data().createdBy
        }
        resolve(movement)
      }
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function getMovements() {
  return new Promise<Movements>((resolve, reject) => {
    // const q = query(collection(db, "cities"), where("capital", "==", true));
    // const q = query(collection(db, "movements"), where("idEntrevista", "==", ""), orderBy("fecha"), orderBy("horario"));
    // const q = query(collection(db, "movements"), orderBy("fecha"), orderBy("horario"));
    const q = query(collection(db, "movements"), orderBy("date"));
    getDocs(q).then(querySnapshot => {
      let movements: Movements = []
      querySnapshot.forEach((doc) => {
        let movment: Movement = {
          id: doc.id,
          description: doc.data().description,
          amount: doc.data().amount,
          type: doc.data().type,
          date: doc.data().date,
          createdBy: doc.data().createdBy
        }
        movements.push(movment)
      });
      resolve(movements)
      resolve(movements)
    }).catch(error => {
      reject(error.message)
    })
  })
}


export function newMovement(movement: Movement) {
  return new Promise<void>((resolve, reject) => {
    console.log("movement NEW => ", movement)
    addDoc(collection(db, "movements"), movement).then(documentSnapshot => {
      newEventNotification(
        `Nuevo ${movement.type}`,
        `Monto del movimiento: ${priceFormat.format(movement.amount)}`,
        `/movements/${documentSnapshot.id}`
      );
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}



export function editMovement(idMovement: string, movement: Movement) {
  return new Promise<void>((resolve, reject) => {
    let refMovement = doc(db, "movements", idMovement)
    updateDoc(refMovement, { ...movement }).then(movementSnapshot => {
      newEventNotification(
        `${movement.type} modificado`,
        `Se modificó este movimiento recientemente`,
        `/movements/${idMovement}`
      );
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function signInGoogle() {
  return new Promise<User>((resolve, reject) => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          const userRefDoc = doc(db, 'users', user.uid);
          getDoc(userRefDoc).then(userDocSnapshot => {
            if (!userDocSnapshot.exists()) {
              let userProfile: UserProfile = {
                displayName: user.displayName,
                email: user.email,
                emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber,
                photoURL: user.photoURL,

                roles: ["user"]
              }
              setDoc(userRefDoc, userProfile)
                .then(userDocCreatedSnapshot => {
                  resolve(user)
                }).catch(error => {
                  reject(error.message)
                })
            } else {
              resolve(user)
            }
          }).catch(error => {
            console.error("Error col users => ", error)
            resolve(user)
          })
        } else {
          const code = "ERROR";
          const message = "Error";
          reject({ code, message })
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const code = error.code;
        const message = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        reject({ code, message, email, credential })
      });
  })
}


export function getAllUsers() {
  return new Promise<UsersProfile>((resolve, reject) => {
    const q = query(collection(db, "users"));
    getDocs(q).then(querySnapshot => {
      let users: UsersProfile = []
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let user: UserProfile = {
          id: doc.id,
          displayName: doc.data().displayName,
          email: doc.data().email,
          phoneNumber: doc.data().phoneNumber,
          photoURL: doc.data().photoURL,
          roles: doc.data().roles
        }
        users.push(user)
      });
      resolve(users)
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function addRolToUser(rol: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    let refUser = doc(db, "users", id)
    updateDoc(refUser, {
      roles: arrayUnion(rol)
    }).then(r => {
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}


export function newReservation(reservation: Reservation) {
  return new Promise<void>((resolve, reject) => {
    addDoc(collection(db, "reservations"), reservation).then(documentSnapshot => {
      newEventNotification(
        `Nueva reservacion`,
        `Se realizó una reservacion para el ${reservation.date.toDate().toLocaleDateString()}`,
        `/reservations/${documentSnapshot.id}`
      );
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}



export function editReservation(idReservation: string, reservation: Reservation) {
  return new Promise<void>((resolve, reject) => {
    let refReservation = doc(db, "reservations", idReservation)
    updateDoc(refReservation, { ...reservation }).then(reservationSnapshot => {
      newEventNotification(
        `Reservación modificada`,
        `Una reservación fué modificada recientemente.`,
        `/reservations/${idReservation}`
      );
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function getReservation(idReservation: string) {
  return new Promise<Reservation>((resolve, reject) => {
    let ref = doc(db, "reservations", idReservation)
    getDoc(ref).then(documentSnapshot => {
      if (documentSnapshot.exists()) {
        let reservation: Reservation = {
          id: documentSnapshot.id,
          description: documentSnapshot.data().description,
          date: documentSnapshot.data().date,
          phone: documentSnapshot.data().phone,
          phone2: documentSnapshot.data().phone2,
          address: documentSnapshot.data().address,
          budget: documentSnapshot.data().budget,
          createdBy: documentSnapshot.data().createdBy
        }
        resolve(reservation)
      }
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function getReservations() {
  return new Promise<Reservations>((resolve, reject) => {
    const q = query(collection(db, "reservations"));
    getDocs(q).then(querySnapshot => {
      let reservations: Reservations = []
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let reservation: Reservation = {
          id: doc.id,
          description: doc.data().description,
          date: doc.data().date,
          phone: doc.data().phone,
          phone2: doc.data().phone2,
          address: doc.data().address,
          budget: doc.data().budget,
          createdBy: doc.data().createdBy
        }
        reservations.push(reservation)
      });
      resolve(reservations)
    }).catch(error => {
      reject(error.message)
    })
  })
}



export function getNotifications() {
  return new Promise<Notifications>((resolve, reject) => {
    const q = query(collection(db, "notifications"));
    getDocs(q).then(querySnapshot => {
      let notifications: Notifications = []
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let notification: Notification = {
          id: doc.id,
          title: doc.data().description,
          description: doc.data().description,
          date: doc.data().date,
          seedForUsers: doc.data().seedForUsers,
          url: doc.data().url,
          createdBy: doc.data().createdBy,
        }
        notifications.push(notification)
      });
      resolve(notifications)
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function onSnapshotNotifications(setNotifications: Function) {
  // const q = query(collection(db, "notifications"), where("createdBy", "!=", getCurrentUser()!.uid));
  const q = query(collection(db, "notifications"), orderBy("date","desc"));
  onSnapshot(q, querySnapshot => {
    let notifications: Notifications = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      let notification: Notification = {
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        date: doc.data().date,
        seedForUsers: doc.data().seedForUsers,
        url: doc.data().url,
        createdBy: doc.data().createdBy,
      }
      notifications.push(notification)
    });
    setNotifications(notifications)
  })
}

export function newNotification(notification: Notification) {
  return new Promise<void>((resolve, reject) => {
    addDoc(collection(db, "notifications"), notification).then(documentSnapshot => {
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}

export function newEventNotification(title: string, description: string, url: string) {
  let user = getCurrentUser();
  if (user) {
    let _notification: Notification = {
      title,
      description,
      date: Timestamp.now(),
      url,
      createdBy: user.uid,
      seedForUsers: []
    }
    newNotification(_notification)
  }
}

export function seedNotification(idNotification: string) {
  return new Promise<void>((resolve, reject) => {
    let user = getCurrentUser();
    let refNotification = doc(db, "notifications", idNotification)
    updateDoc(refNotification, { seedForUsers: arrayUnion(user?.uid) }).then(notificationSnapshot => {
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}
