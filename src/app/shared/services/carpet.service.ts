import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Carpet } from '../models/Carpet';

@Injectable({
  providedIn: 'root'
})
export class CarpetService {

  collectionName = 'Carpets';

  constructor(private afs: AngularFirestore) { }

  create(carpet: Carpet) {
    return this.afs.collection<Carpet>(this.collectionName).doc(carpet.id).set(carpet);
  }

  getAll() {
    return this.afs.collection<Carpet>(this.collectionName).valueChanges();
  }

  update(carpet: Carpet) {
    return this.afs.collection<Carpet>(this.collectionName).doc(carpet.id).set(carpet);
  }

  delete(id: string) {
    return this.afs.collection<Carpet>(this.collectionName).doc(id).delete();
  }
}
