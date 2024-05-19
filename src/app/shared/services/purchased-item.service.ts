import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PurchasedItem } from '../models/PurchasedItem';

@Injectable({
  providedIn: 'root'
})
export class PurchasedItemService {

  collectionName = 'PurchasedItems';

  constructor(private afs: AngularFirestore) { }

  generateId(){
    return this.afs.createId();
  }

  create(purchasedItem: PurchasedItem) {
    return this.afs.collection<PurchasedItem>(this.collectionName).doc(purchasedItem.id).set(purchasedItem);
  }

  getAll() {
    return this.afs.collection<PurchasedItem>(this.collectionName).valueChanges();
  }

  update(purchasedItem: PurchasedItem) {
    return this.afs.collection<PurchasedItem>(this.collectionName).doc(purchasedItem.id).set(purchasedItem);
  }

  delete(id: string) {
    return this.afs.collection<PurchasedItem>(this.collectionName).doc(id).delete();
  }
}
