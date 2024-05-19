import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DisplayPurchase, Purchase } from '../models/Purchase';
import { Observable, catchError, combineLatest, from, map, mergeMap, of, switchMap, take, throwError } from 'rxjs';
import { PurchasedItem } from '../models/PurchasedItem';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  collectionName = 'Purchases';

  constructor(private afs: AngularFirestore) { }

  create(purchase : Purchase) {
    const id = this.afs.createId();
    purchase.id = id;
    return this.afs.collection<Purchase>(this.collectionName).doc(id).set(purchase);
  }

  getAll() {
    return this.afs.collection<Purchase>(this.collectionName).valueChanges();
  }

  getUserPurchasesWithDetails(userId: string): Observable<DisplayPurchase[]> {
    return this.afs.collection<Purchase>(this.collectionName, ref => ref.where('userId', '==', userId))
        .valueChanges({ idField: 'id' })
        .pipe(
            mergeMap(purchases => 
                combineLatest(
                    purchases.map(purchase =>
                        combineLatest(
                            purchase.purchasedItemIds.map(itemId =>
                                this.afs.collection<PurchasedItem>('PurchasedItems').doc<PurchasedItem>(itemId).valueChanges().pipe(
                                    catchError(err => {
                                        console.error('Failed to fetch item:', err);
                                        return of(null);
                                    })
                                )
                            )
                        ).pipe(
                            map(items => ({
                                ...purchase,
                                items: items.filter(item => item !== null) as PurchasedItem[]
                            } as DisplayPurchase))
                        )
                    )
                )
            ),
            catchError(err => {
                console.error('Error fetching purchases:', err);
                return of([]);
            })
        );
  }

  update(purchase: Purchase) {
    return this.afs.collection<Purchase>(this.collectionName).doc(purchase.id).set(purchase);
  }

  delete(id: string) {
    return this.afs.collection<Purchase>(this.collectionName).doc(id).delete();
  }

  deletePurchaseAndItems(purchaseId: string): Observable<void> {
    const batch = this.afs.firestore.batch();

    return this.afs.collection<Purchase>(this.collectionName).doc(purchaseId).get().pipe(
      switchMap(doc => {
        if (!doc.exists) {
          return throwError(() => new Error('Purchase does not exist!'));
        }
        const purchase = doc.data();

        // Schedule deletion of the purchase document
        batch.delete(this.afs.collection<Purchase>(this.collectionName).doc(purchaseId).ref);

        // Schedule deletion of all purchased items
        purchase!.purchasedItemIds.forEach(itemId => {
          batch.delete(this.afs.collection('PurchasedItems').doc(itemId).ref);
        });

        // Commit the batch
        return from(batch.commit());
      }),
      catchError(err => {
        console.error('Failed to delete purchase and items:', err);
        return throwError(() => err);
      })
    );
  }
}
