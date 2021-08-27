import { Injectable } from '@angular/core';
import firebase from 'firebase/app';

// These imports load individual services into the firebase namespace.
import 'firebase/auth';
import 'firebase/firestore';
import "firebase/storage";

import { AppSetting } from '../app-settings/app-setting.service';
import { CommonService } from '../common-service/common.service';
import { LocalStorageService } from '../local-storage-sevice/local-storage.service';
import { firebaseConfig } from './firebase.config';

let firestore;
let storage;
let myRecentlastVisible;
let mySnapshot;
let newSnapShot;

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private loadedTill = 0;
  private sequence = [];
  private user = null;
  constructor(
    private commonService: CommonService,
    private localStorageService: LocalStorageService
  ) {
    // console.log('firebase');
    this.initializeApp()
  }

  /*
   * Method use to remove Chat Snapshot used in recent chat list
   */
  public removeTotalSnapshot() {
    if (firestore && mySnapshot) {
      mySnapshot();
    }
  }

  public removeNewSnapshot() {
    if (firestore && newSnapShot) {
      newSnapShot();
    }
  }

  /**
   * Function to intialize the firebase with the given config setting
   */
  public initializeApp = () => {
    //  if (firebase.app()) {
    if (firebase.apps.length > 0) {
      firestore = firebase.app().firestore();
      storage = firebase.storage()
    } else {
      // use platform-specific firebase config
      let firebaseApp = firebase.initializeApp(firebaseConfig[AppSetting.ENVIRONMENT_NAME]);
      firestore = firebaseApp.firestore();
      storage = firebase.storage()
    }
    firebase.auth().onAuthStateChanged((user) => {
      // console.log(user);
      if (user) {
        this.localStorageService.setItem('loggedIn', true);
      } else {
        this.localStorageService.setItem('loggedIn', false);
        this.removeTotalSnapshot();
        this.removeNewSnapshot();
      }
    });
  }


  /**
   * signIn - Function to login in frebase using the email and password
   */
  public signIn(email, password, keepMeLoggedIn) {

    return new Promise((resolve, reject) => {
      let persistence
      if (keepMeLoggedIn) {
        persistence = firebase.auth.Auth.Persistence.LOCAL;
      } else {
        persistence = firebase.auth.Auth.Persistence.SESSION;
      }
      setTimeout(() => {
        let error = {
          message: this.commonService.getTranslate("error_server_message")
        }
        reject(error);
      }, 30 * 1000);         // 30 seconds timeout
      firebase.auth().setPersistence(persistence)
        .then(() => {
          firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((response) => {
              resolve(response);
            })
            .catch(error => {
              let newErr = {
                message: error.message
              }
              if (error.code === 'auth/wrong-password') {
                newErr.message = this.commonService.getTranslate('firebase_wrong_credentials');
              }
              else if (error.code === 'auth/user-not-found') {
                newErr.message = this.commonService.getTranslate('firebase_wrong_credentials');
              }
              else if (error.code === 'auth/user-disabled') {
                newErr.message = this.commonService.getTranslate('firebase_blocked_account');
              } else if (error.code === 'auth/network-request-failed') {
                newErr.message = this.commonService.getTranslate('error_network_title');
              }
              reject(newErr);
            });

        })
        .catch((error) => {
          // Handle Errors here.
          reject(error);
        });
    });
  }

  /**
   * resetPassword - function to call the reset password function of firebase
   */
  public resetPassword(email) {
    return new Promise((resolve, reject) => {

      firebase.auth()
        .sendPasswordResetEmail(email)
        .then((response) => {
          resolve(response);
        })
        .catch(error => {
          let newErr = {
            message: error.message
          }
          if (error.code === 'auth/user-not-found') {
            newErr.message = this.commonService.getTranslate('firebase_unregistered_user');
          } else if (error.code === 'auth/network-request-failed') {
            newErr.message = this.commonService.getTranslate('error_network_title');
          } else {
            newErr.message = error.message
          }
          reject(newErr);
        });

    });

  }

  public confirmPassword(code, password) {
    return new Promise((resolve, reject) => {

      firebase.auth()
        .confirmPasswordReset(code, password)

        .then((response) => {
          resolve(response);
        })
        .catch(error => {
          let newErr = {
            message: error.message
          }
          if (error.code === 'auth/user-not-found') {
            newErr.message = this.commonService.getTranslate('firebase_unregistered_user');
          } else if (error.code === 'auth/network-request-failed') {
            newErr.message = this.commonService.getTranslate('error_network_title');
          } else {
            newErr.message = error.message
          }
          reject(newErr);
        });

    });

  }

  /**
   * getUser - get the the current loggedin user if present else null
   */
  public getUser() {
    // return this.user
    const user = firebase.auth().currentUser;
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  /**
   * signOut - function to signout the loggedin firebase user
   */
  public signOut() {
    firebase.auth().signOut();
    this.localStorageService.clearAllLocalStorage();
    this.removeTotalSnapshot();
    this.removeNewSnapshot();
  }

  /**
   * creatCase - function to create a new case in firebase
   */
  public createCase(data) {
    return new Promise((resolve, reject) => {
      let message = {
        skillLevel: data.skillLevel,
        supplement: data.supplement,
        isPublish: data.isPublish,
        details: data.details,
        result: data.result,
        nextStep: data.nextStep,
        references: data.references,
        created_time: firebase.firestore.FieldValue.serverTimestamp(),
        updated_time: firebase.firestore.FieldValue.serverTimestamp(),
        attachments: [data.uploadUrl],
        dimensions: data.dimensions,
      };
      firestore
        .collection(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${message.skillLevel}/Cases`)
        .add(message)
        .then((res) => {
          // console.log("res", res);
          this.updateCount(message.skillLevel, 1, 'add', res.id, data.caseNumber - 1).then(() => {
            resolve(res.id);
          }).catch((err) => {
            reject(err);
          })
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  /**
   * editCase - function to edit a new case in firebase
   */
  public editCase(data) {
    // console.log('edit', data);
    return new Promise((resolve, reject) => {
      let Case = {
        skillLevel: data.skillLevel,
        supplement: data.supplement,
        isPublish: data.isPublish,
        details: data.details,
        result: data.result,
        nextStep: data.nextStep,
        references:data.references,
        updated_time: firebase.firestore.FieldValue.serverTimestamp(),
        attachments: [data.uploadUrl],
        dimensions: data.dimensions,
      };
      firestore
        .collection(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${Case.skillLevel}/Cases`)
        .doc(data.firebaseId)
        .set(Case, { merge: true })
        .then((res) => {
          // no need to update the sequence
          if (data.caseNumber == data.oldCaseNumber) {
            resolve(false);
          } else {
            this.reorderCase(data.caseNumber - 1, data.oldCaseNumber - 1).then(() => {
              resolve(true);
            }).catch((err) => {
              reject(err);
            })
          }
        })
        .catch((error) => {
          reject(error);
        });

    });

  }

  /**
   * reorderCase - function to reorder the case in firebase
   */
  public reorderCase(to, from) {
    return new Promise((resolve, reject) => {
      this.sequence.splice(to, 0, ...this.sequence.splice(from, 1))

      let updateDoc = {
        sequence: this.sequence,
        updated_time: firebase.firestore.FieldValue.serverTimestamp(),
      };
      firestore
        .doc(`env/${AppSetting.ENVIRONMENT_NAME}/Level/Beginner/Stats/totalStats`)
        .set(updateDoc, { merge: true })
        .then((res) => {
          resolve('Success');
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  /**
   * reorderCase - function to reorder the case in firebase
   */
  public switchCase(skillLevel, to, from) {
    return new Promise((resolve, reject) => {
      [this.sequence[to], this.sequence[from]] = [this.sequence[from], this.sequence[to]];

      let updateDoc = {
        sequence: this.sequence,
        updated_time: firebase.firestore.FieldValue.serverTimestamp(),
      };
      firestore
        .doc(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${skillLevel}/Stats/totalStats`)
        .set(updateDoc, { merge: true })
        .then((res) => {
          resolve('Success');
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  public deletCase(data) {
    return new Promise((resolve, reject) => {
      firestore
        .collection(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${data.skillLevel}/Cases`)
        .doc(`${data.firebaseId}`)
        .delete()
        .then((res) => {
          data.attachments.forEach(element => {
            this.deleteImage(element)
          });
          // to reduce the loaded count in case of delete
          this.loadedTill--;
          this.updateCount(data.skillLevel, -1, 'delete', data.firebaseId, data.index - 1).then(() => {
            resolve('Success');
          }).catch((err) => {
            reject(err);
          })
        })
        .catch((error) => {
          reject(error);
        });

    });

  }

  /**
   * getCase2 - function to get the ordered list of data based on sequence from array
   */
  public async getCases(skillLevel, isPagination, limit, isLoadPrevious) {
    return new Promise((resolve, reject) => {
      firestore
        .doc(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${skillLevel}/Stats/totalStats`)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot) {
            if (querySnapshot?.data()) {
              const tempDoc = querySnapshot.data({ serverTimestamps: "estimate" });
              const sequence = tempDoc.sequence;

              let sequenceToGetData = [];
              if (isPagination) {
                if (isLoadPrevious && this.loadedTill) {
                  let getDataTill = this.loadedTill + limit;
                  getDataTill = getDataTill > sequence.length ? sequence.length : getDataTill;
                  sequenceToGetData = sequence.slice(this.loadedTill, getDataTill);
                  this.loadedTill = getDataTill;
                } else {
                  sequenceToGetData = sequence.slice(0, limit);
                  this.loadedTill = limit;
                }
              } else {
                sequenceToGetData = sequence;
              }

              let itemRefs = sequenceToGetData.map(caseId => {
                return firestore
                  .collection(`env/${AppSetting.ENVIRONMENT_NAME}/Level/Beginner/Cases`)
                  .doc(caseId)
                  .get();
              });

              Promise.all(itemRefs)
                .then((docs) => {
                  let result = docs.map((doc: any) => {
                    const tempDoc = doc.data({ serverTimestamps: "estimate" });
                    tempDoc.created_time = this.toDate(tempDoc.created_time);
                    tempDoc.updated_time = this.toDate(tempDoc.updated_time);
                    tempDoc.firebaseId = doc.id;
                    return tempDoc
                  });
                  resolve(result);
                })
                .catch((error) => {
                  reject(error);
                });

            } else {
              resolve([]);
            }
          } else {
            resolve([]);
          }
        })

    });
  }



  /**
   * name
   */
  public updateCount(skillLevel, count, action, id: any, caseNumber) {
    let updateDoc;
    if (action == 'delete') {
      return new Promise((resolve, reject) => {
        updateDoc = {
          // activeCount: activeCount,
          updated_time: firebase.firestore.FieldValue.serverTimestamp(),
          sequence: firebase.firestore.FieldValue.arrayRemove(id),
        }
        let query;
        query = firestore.doc(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${skillLevel}/Stats/totalStats`)
        query.set(updateDoc, { merge: true })
          .then((res) => {
            resolve(res);
          }).catch(error => {
            reject(error);
          });
      });
    } else if (action == 'add') {
      let query;
      query = firestore.doc(`env/${AppSetting.ENVIRONMENT_NAME}/Level/${skillLevel}/Stats/totalStats`);
      return firestore.runTransaction((transaction) => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(query).then((tempDoc) => {
          let sequence = tempDoc?.data()?.sequence;
          if(!sequence){
            sequence =[];
          }
          // console.log('sequence', sequence.length);
          // console.log('casenumber', caseNumber);
          sequence.splice(caseNumber, 0, id);
          updateDoc = {
            sequence: sequence,
            updated_time: firebase.firestore.FieldValue.serverTimestamp(),
          }
          transaction.set(query, updateDoc, { merge: true });
        });
      })
        .then((newPopulation) => {
          // console.log("Population increased to ", newPopulation);
        }).catch((err) => {
          // This will be an "population is too big" error.
          console.error(err);
        });
    }


  }


  /**
   * setRecentMessageSnapshot - function to set the snapshot for recent messsage
   * so to get updates for any new recent messages
   */
  public setTotalSnapshot(callback) {
    this.removeTotalSnapshot();
    mySnapshot = firestore
      .collection(`env/${AppSetting.ENVIRONMENT_NAME}/Level/Beginner/Stats`)
      .orderBy("updated_time", "desc")
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          // let dataMsgs = [];
          querySnapshot?.forEach((doc) => {
            if (doc?.data()) {
              const tempDoc = doc.data({ serverTimestamps: "estimate" });
              tempDoc.updated_time = this.toDate(tempDoc.updated_time);

              tempDoc.firebaseId = doc.id;

              this.sequence = tempDoc.sequence;
              if (!doc.metadata.hasPendingWrites) {
                if (callback) {
                  callback(tempDoc);
                }
              }
            }
          });
        },
        (error) => {
          console.error("setTotalSnapshot error", error);
        }
      );
  }

  public setNewSnapshot(callback) {
    this.removeNewSnapshot();
    newSnapShot = firestore
      .collection(`env/${AppSetting.ENVIRONMENT_NAME}/Level/Beginner/Cases`)
      .orderBy("updated_time", "desc")
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          // let dataMsgs = [];
          querySnapshot?.forEach((doc) => {
            if (doc?.data()) {
              const tempDoc = doc.data({ serverTimestamps: "estimate" });
              tempDoc.created_time = this.toDate(tempDoc.created_time);
              tempDoc.updated_time = this.toDate(tempDoc.updated_time);
              tempDoc.firebaseId = doc.id;
              if (!doc.metadata.hasPendingWrites) {
                if (callback) {
                  callback(tempDoc);
                }
              }
            }
          });
        },
        (error) => {
          console.error("setTotalSnapshot error", error);
        }
      );
  }

  /**
   * Function to convert firebase date to js date
   */
  private toDate(time) {
    if (typeof time === "object" && time !== null) {
      return time.toDate();
    }
    return time;
  }


  /**
   * getMediaUrl
   */
  public getMediaUrl(path) {
    return new Promise((resolve, reject) => {
      storage.ref(`env/${AppSetting.ENVIRONMENT_NAME}/attachment/${path}`).getDownloadURL()
        .then(url => {
          resolve(url);
        })
        .catch(error => {
          // console.log("getDownloadURL ==>", error);
          reject(error);
        });
    });
  }

  /**
   * uploadImage
   */
  public uploadImage(file, oldImg) {
    // console.log('prrr')
    const tmpFileName = new Date().getTime();
    const ext = file.name.split('.').pop();
    const filename = `${file.name ? file.name.split('.')[0] + '_' + tmpFileName : tmpFileName}.${ext}`;
    var uploadString = `env/${AppSetting.ENVIRONMENT_NAME}/attachment/${filename}`;
    var response = { state: '', data: '' }
    return new Promise((resolve, reject) => {
      storage
        .ref(uploadString)
        .put(file)
        .then(result => {
          if (oldImg) {
            this.deleteImage(oldImg)
          }
          resolve(filename);
        }).catch(error => {
          reject(error);
        })
    })
  }

  public deleteImage(path) {
    // console.log("path-----------------", path);
    return new Promise((resolve, reject) => {
      storage.ref(`env/${AppSetting.ENVIRONMENT_NAME}/attachment/${path}`).delete()
        .then(url => {
          resolve('success')
        })
        .catch(error => {
          reject(error);
        });
    });
  }


}









