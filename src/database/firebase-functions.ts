import app, { db, auth, messaging, vapidKey } from "./firebase-init";

import { collection, query, where, orderBy, getDocs, addDoc, getDoc, doc, updateDoc, setDoc, onSnapshot, Timestamp, arrayUnion } from "firebase/firestore";
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import UserProfile, { UsersProfile } from "../models/UserProfile";
import Movement, { Movements } from "../models/Movement";
import Reservation, { Reservations } from "../models/Reservation";
import { getToken, onMessage } from "firebase/messaging";
import SnackNotification from "../models/SnackNotification";
import axios from "axios"


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
      // for(let i = 0 ; i< 25 ; i++){
      //   let movment: Movement = {
      //     id: "doc.id"+i,
      //     description: "description "+i,
      //     amount: Math.random()*100,
      //     type: i%3 ? "egress" : "entry",
      //     date: Timestamp.fromDate(new Date("11/"+(i+1)+"/2021"))
      //   }
      //   movements.push(movment)
      // }
      resolve(movements)
      resolve(movements)
    }).catch(error => {
      reject(error.message)
    })
  })
}

// export function getMovementsDisponebles() {
//   return new Promise<Movements>((resolve, reject) => {
//     const q = query(collection(db, "movements"), where("idEntrevista", "==", ""), orderBy("fecha"), orderBy("horario"));
//     getDocs(q).then(querySnapshot => {
//       let movements: Movements = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         movements.push({
//           id: doc.id,
//           fecha: doc.data().fecha,
//           horario: doc.data().horario,
//           idEntrevista: doc.data().idEntrevista
//         })
//       });
//       resolve(movements)
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


// export function getUsedMovements() {
//   return new Promise<Movements>((resolve, reject) => {
//     // const q = query(collection(db, "cities"), where("capital", "==", true));
//     const q = query(collection(db, "movements"), where("idEntrevista", "!=", ""), orderBy("idEntrevista"), orderBy("fecha"), orderBy("horario"));
//     getDocs(q).then(querySnapshot => {
//       let movements: Movements = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         movements.push({
//           id: doc.id,
//           fecha: doc.data().fecha,
//           horario: doc.data().horario,
//           idEntrevista: doc.data().idEntrevista
//         })
//       });
//       resolve(movements)
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


export function newMovement(movement: Movement) {
  return new Promise<void>((resolve, reject) => {
    addDoc(collection(db, "movements"), movement).then(documentSnapshot => {
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
      resolve()
    }).catch(error => {
      reject(error.message)
    })
  })
}



// export function getEntrevista(idEntrevista: string) {
//   return new Promise<Entrevista>((resolve, reject) => {
//     let ref = doc(db, "entrevistas", idEntrevista)
//     getDoc(ref).then(documentSnapshot => {
//       if (documentSnapshot.exists()) {
//         let entrevista: Entrevista = {
//           id: documentSnapshot.id,
//           nombres: documentSnapshot.data().nombres,
//           apellidos: documentSnapshot.data().apellidos,
//           nombresTutor: documentSnapshot.data().nombresTutor,
//           apellidosTutor: documentSnapshot.data().apellidosTutor,
//           telefonoTutor: documentSnapshot.data().telefonoTutor,
//           telefonoAlternativoTutor: documentSnapshot.data().telefonoAlternativoTutor,
//           // emailTutor: documentSnapshot.data().//,
//           movement: documentSnapshot.data().movement,
//           estado: documentSnapshot.data().estado,
//         }
//         resolve(entrevista)
//       }
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function getEntrevistas() {
//   return new Promise<Entrevistas>((resolve, reject) => {
//     // const q = query(collection(db, "cities"), where("capital", "==", true));
//     const q = query(collection(db, "entrevistas"));
//     getDocs(q).then(querySnapshot => {
//       let entrevistas: Entrevistas = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         let entrevista: Entrevista = {
//           id: doc.id,
//           nombres: doc.data().nombres,
//           apellidos: doc.data().apellidos,
//           nombresTutor: doc.data().nombresTutor,
//           apellidosTutor: doc.data().apellidosTutor,
//           telefonoTutor: doc.data().telefonoTutor,
//           telefonoAlternativoTutor: doc.data().telefonoAlternativoTutor,
//           // emailTutor: doc.data().//,
//           movement: doc.data().movement,
//           estado: doc.data().estado,
//         }
//         entrevistas.push(entrevista)
//       });
//       resolve(entrevistas)
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function newEntrevista(entrevista: Entrevista) {
//   return new Promise<string>((resolve, reject) => {
//     addDoc(collection(db, "entrevistas"), entrevista).then(documentSnapshot => {
//       let refMovement = doc(db, "movements", entrevista.movement)
//       updateDoc(refMovement, { idEntrevista: documentSnapshot.id }).then(movementSnapshot => {
//         resolve(documentSnapshot.id)
//       }).catch(error => {
//         reject(error.message)
//       })
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


// export function editEntrevista(idEntrevista: string, entrevista: Entrevista) {
//   return new Promise<void>((resolve, reject) => {
//     let refEntrevista = doc(db, "entrevistas", idEntrevista)
//     updateDoc(refEntrevista, { ...entrevista }).then(entrevistaSnapshot => {
//       let refMovement = doc(db, "movements", entrevista.movement)
//       updateDoc(refMovement, { idEntrevista }).then(movementSnapshot => {
//         resolve()
//       }).catch(error => {
//         reject(error.message)
//       })
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


// export function changeEstadoEntrevista(id: string, nuevoEstado: EstadosEntrevistaType, movementId: string) {
//   return new Promise<void>((resolve, reject) => {
//     //   if (nuevoEstado == EstadosEntrevistaValues.PENDIENTE) {
//     //     let refMovement = doc(db, "movements", movementId)
//     //     getDoc(refMovement).then(movementSnapshot => {
//     //       if (movementSnapshot.exists() && movementSnapshot.data().idEntrevista == '')
//     //         updateDoc(refMovement, { idEntrevista: id }).then(movementSnapshot => {
//     //           updateDoc(ref, { estado: nuevoEstado }).then(entrevistaSnapshot => {
//     //             resolve()
//     //           }).catch(error => {
//     //             reject(error.message)
//     //           })
//     //         }).catch(error => {
//     //           reject(error.message)
//     //         })
//     //     }).catch(error => {
//     //       reject(error.message)
//     //     })
//     //   }
//     let ref = doc(db, "entrevistas", id)
//     updateDoc(ref, { estado: nuevoEstado }).then(entrevistaSnapshot => {
//       if (nuevoEstado == EstadosEntrevistaValues.CANCELADA) {
//         let refMovement = doc(db, "movements", movementId)
//         updateDoc(refMovement, { idEntrevista: "" }).then(movementSnapshot => {
//           resolve()
//         }).catch(error => {
//           reject(error.message)
//         })
//       } else {
//         resolve()
//       }
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function signIn(email: string, password: string) {
//   return new Promise<User>((resolve, reject) => {
//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         const user = userCredential.user;
//         resolve(user)
//       })
//       .catch((error) => {
//         const code = error.code;
//         const message = error.message;
//         reject({ code, message })
//       });
//   })
// }

// export function signUp(email: string, password: string) {
//   return new Promise<User>((resolve, reject) => {
//     reject({
//       code: "Error",
//       message: "Metodo aun no disponible."
//     })
//     // createUserWithEmailAndPassword(auth, email, password)
//     //   .then((userCredential) => {
//     //     const user = userCredential.user;
//     //     const userRefDoc = doc(db, 'users', user.uid);
//     //     getDoc(userRefDoc).then(userDocSnapshot => {
//     //       if(!userDocSnapshot.exists()){
//     //         setDoc(userRefDoc, {roles: ["user"]})
//     //           .then(userDocCreatedSnapshot => {
//     //             resolve(user)
//     //           }).catch(error => {
//     //             reject(error.message)
//     //           })
//     //       } else {
//     //         resolve(user)
//     //       }
//     //     }).catch(error => {
//     //       console.error("Error col users => ", error)
//     //       resolve(user)
//     //     })
//     //   })
//     //   .catch((error) => {
//     //     const code = error.code;
//     //     const message = error.message;
//     //     reject({ code, message })
//     //   });
//   })
// }


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

// export function initDepts() {
//   const departamentos: Departamentos = []
//   departamentos.forEach(departamento => {
//     addDoc(collection(db, "departamentos"), departamento).then(documentSnapshot => {
//     }).catch(error => {
//       console.error(departamento.nombre + " => ", error)
//     })
//   })
// }

// export function initMaterias() {
//   const materias: Materias = []
//   materias.forEach(materia => {
//     addDoc(collection(db, "materias"), materia).then(documentSnapshot => {
//     }).catch(error => {
//       console.error(materia.nombre + " => ", error)
//     })
//   })
// }

// export function initProfesores() {
//   const docentes: Docentes = DocentesInitial
//   docentes.forEach(docente => {
//     addDoc(collection(db, "docentes"), docente).then(documentSnapshot => {
//     }).catch(error => {
//       console.error(docente.email + " => ", error)
//     })
//   })
// }




// export function newAsistenciaJornada(asistencia: AsistenciaJornada) {
//   return new Promise<string>((resolve, reject) => {
//     const q = query(collection(db, "asistencias-a-jornadas"), where("idJornada", "==", asistencia.idJornada), where("dni", "==", asistencia.dni));
//     // const q = query(collection(db, "asistencias-a-jornadas"));
//     getDocs(q).then(querySnapshot => {
//       let asistencias: AsistenciasJornada = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         let asistencia: AsistenciaJornada = {
//           id: doc.id,
//           nombres: doc.data().nombres,
//           apellidos: doc.data().apellidos,
//           dni: doc.data().dni,
//           numeroDeEmpleado: doc.data().numeroDeEmpleado,
//           solicitudesjj: [...doc.data().solicitudesjj],
//           idJornada: doc.data().idJornada,
//         }
//         asistencias.push(asistencia)
//       });
//       if (asistencias.length > 0) {
//         reject("Ya registraste tu asistencia anteriormente")
//       } else {
//         addDoc(collection(db, "asistencias-a-jornadas"), asistencia).then(documentSnapshot => {
//           resolve(documentSnapshot.id)
//         }).catch(error => {
//           reject(error.message)
//         })
//       }
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function getAsistenciasJornada(idJornada: string) {
//   return new Promise<AsistenciasJornada>((resolve, reject) => {
//     const q = query(collection(db, "asistencias-a-jornadas"), where("idJornada", "==", idJornada));
//     // const q = query(collection(db, "asistencias-a-jornadas"));
//     getDocs(q).then(querySnapshot => {
//       let asistencias: AsistenciasJornada = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         let asistencia: AsistenciaJornada = {
//           id: doc.id,
//           nombres: doc.data().nombres,
//           apellidos: doc.data().apellidos,
//           dni: doc.data().dni,
//           numeroDeEmpleado: doc.data().numeroDeEmpleado,
//           solicitudesjj: [...doc.data().solicitudesjj],
//           idJornada: doc.data().idJornada,
//         }
//         asistencias.push(asistencia)
//       });
//       resolve(asistencias)
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }



// export function getJornada() {
//   return new Promise<Jornada>((resolve, reject) => {
//     const q = query(collection(db, "jornadas"), where("concluida", "==", false));
//     getDocs(q).then(querySnapshot => {
//       let jornadas: Jornadas = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         let jornada: Jornada = {
//           id: doc.id,
//           fecha: doc.data().fecha,
//           concluida: doc.data().concluida,
//           justificada: doc.data().justificada
//         }
//         jornadas.push(jornada)
//       });
//       if (jornadas.length == 1) {
//         resolve(jornadas[0])
//       } else {
//         if (jornadas.length == 0) {
//           reject("No existe una jornada activa.")
//         } else {
//           reject("Hay mas de una jornada activa, consulte secretaria.")
//         }
//       }
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function getJornadaById(id: string) {
//   return new Promise<Jornada>((resolve, reject) => {
//     let ref = doc(db, "jornadas", id)
//     getDoc(ref).then(documentSnapshot => {
//       if (documentSnapshot.exists()) {
//         let jornada: Jornada = {
//           id: documentSnapshot.id,
//           fecha: documentSnapshot.data().fecha,
//           concluida: documentSnapshot.data().concluida,
//           justificada: documentSnapshot.data().justificada,
//         }
//         resolve(jornada)
//       } else {
//         reject("No existe la jornada buscada")
//       }
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function getJornadas() {
//   return new Promise<Jornadas>((resolve, reject) => {
//     // const q = query(collection(db, "cities"), where("capital", "==", true));
//     const q = query(collection(db, "jornadas"));
//     getDocs(q).then(querySnapshot => {
//       let jornadas: Jornadas = []
//       querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         let jornada: Jornada = {
//           id: doc.id,
//           fecha: doc.data().fecha,
//           concluida: doc.data().concluida,
//           justificada: doc.data().justificada
//         }
//         jornadas.push(jornada)
//       });
//       resolve(jornadas)
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


// export function newJornada(fecha: string) {
//   let jornada: Jornada = {
//     fecha: Timestamp.fromDate(new Date(fecha)),
//     concluida: false,
//     justificada: false
//   }
//   return new Promise<void>((resolve, reject) => {
//     addDoc(collection(db, "jornadas"), jornada).then(documentSnapshot => {
//       resolve()
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


// export function justificarJornada(idJornada: string) {
//   return new Promise<void>((resolve, reject) => {
//     let refJornada = doc(db, "jornadas", idJornada)
//     updateDoc(refJornada, { justificada: true }).then(jornadaSnapshot => {
//       resolve()
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }


// export function justificarAsistenciaPorEscuela(idAsistencia: string, escuela: string) {
//   return new Promise<void>((resolve, reject) => {
//     let refAsistencia = doc(db, "asistencias-a-jornadas", idAsistencia)
//     getDoc(refAsistencia).then(documentSnapshot => {
//       if (documentSnapshot.exists()) {
//         let solicitudesjj: EstadoEscuelaJJ[] = documentSnapshot.data().solicitudesjj
//         solicitudesjj.forEach((element, index) => {
//           if(element.nombre == escuela)
//             solicitudesjj[index].justificada = true;
//         });
//         updateDoc(refAsistencia, { solicitudesjj }).then(jornadaSnapshot => {
//           resolve()
//         }).catch(error => {
//           reject(error.message)
//         })
//       }
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }

// export function togleJornadaState(id: string, name: string, newState: boolean) {
//   return new Promise<void>((resolve, reject) => {
//     let refJornada = doc(db, "jornadas", id)
//     updateDoc(refJornada, { [name]: newState }).then(jornadaSnapshot => {
//       resolve()
//     }).catch(error => {
//       reject(error.message)
//     })
//   })
// }




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
      resolve()
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
