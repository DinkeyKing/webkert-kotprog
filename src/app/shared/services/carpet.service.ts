import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Carpet } from '../models/Carpet';
import { Observable } from 'rxjs';
import { where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CarpetService {

  collectionName = 'Carpets';

  constructor(private afs: AngularFirestore) { }

  generateId(){
    return this.afs.createId();
  }

  create(carpet: Carpet) {
    return this.afs.collection<Carpet>(this.collectionName).doc(carpet.id).set(carpet);
  }

  getAll() : Observable<Carpet[]> {
    return this.afs.collection<Carpet>(this.collectionName).valueChanges();
  }

  getById(id: string) {
    return this.afs.collection<Carpet>(this.collectionName).doc(id).valueChanges();
  }

  update(carpet: Carpet) {
    return this.afs.collection<Carpet>(this.collectionName).doc(carpet.id).set(carpet);
  }

  delete(id: string) {
    return this.afs.collection<Carpet>(this.collectionName).doc(id).delete();
  }
}
