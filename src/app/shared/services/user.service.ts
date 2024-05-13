import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/User';
import { where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  collectionName = 'Users';

  constructor(private afs: AngularFirestore) { }

  create(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).set(user);
  }

  getAll() {
    return this.afs.collection<User>(this.collectionName).valueChanges();
  }

  getById(id: string) {
    return this.afs.collection<User>(this.collectionName).doc(id).valueChanges();
  }

  getByEmail(email : string){
    return this.afs.collection<User>(this.collectionName, ref => ref.where('email', '==', email)).valueChanges();
  }

  update(user: User) {
    return this.afs.collection<User>(this.collectionName).doc(user.id).set(user);
  }

  delete(id: string) {
    return this.afs.collection<User>(this.collectionName).doc(id).delete();
  }
}
