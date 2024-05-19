import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CartItem, DisplayCartItem } from '../models/CartItem';
import { BehaviorSubject, EMPTY, Observable, Subscription, catchError, combineLatest, defaultIfEmpty, filter, from, map, mergeMap, of, switchMap, take, tap, toArray } from 'rxjs';
import { Carpet } from '../models/Carpet';

@Injectable({
  providedIn: 'root'
})
export class CartItemService {
  
  collectionName = 'CartItems';

  public cartItemsSubject = new BehaviorSubject<DisplayCartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  public subscription! : Subscription

  constructor(private afs: AngularFirestore) { }

  create(cartItem: CartItem) {
    cartItem.id = this.afs.createId();
    return this.afs.collection<CartItem>(this.collectionName).doc(cartItem.id).set(cartItem);
  }

  getAll() : Observable<CartItem[]> {
    return this.afs.collection<CartItem>(this.collectionName).valueChanges();
  }

  getByUserId(userId : string) : Observable<CartItem[]>{
    if (!userId) return of([]); // Immediate return if userId is undefined or invalid

    return this.afs.collection<CartItem>(this.collectionName, ref => ref.where('userId', '==', userId))
    .valueChanges();
  }
  
  deleteAllCartItemsForUser(userId: string): Observable<void> {
    const batch = this.afs.firestore.batch();

    return from(this.afs.collection(this.collectionName, ref => ref.where('userId', '==', userId)).get()).pipe(
      switchMap(querySnapshot => {
        querySnapshot.forEach(doc => {
          batch.delete(doc.ref); // Schedule each document for deletion
        });

        return from(batch.commit()); // Commit the batch
      }),
      catchError(err => {
        console.error('Failed to delete cart items:', err);
        throw err; // Rethrow or handle error appropriately
      })
    );
  }

  getDisplayCartItems(userId: string): void {
    if (!userId) {
      console.error('User not found!');
      return;
    }
  
    if (this.subscription) {
      this.subscription.unsubscribe();  // Unsubscribe from any previous subscription
    }
  
    this.subscription = this.getByUserId(userId).pipe(
      mergeMap(cartItems => from(cartItems)),
      mergeMap(cartItem =>
        this.afs.collection<Carpet>('Carpets').doc<Carpet>(cartItem.carpetId).valueChanges().pipe(
          map(carpet => carpet ? {
            carpetName: carpet.name,
            amount: cartItem.amount,
            cartItemId: cartItem.id,
            price: cartItem.amount * carpet.price
          } : null),
          filter((item): item is DisplayCartItem => item !== null),
          catchError(err => {
            console.error('Error processing carpet data:', err);
            return of(null); // Handle null items
          })
        )
      ),
      catchError(err => {
        console.error('Error fetching cart items:', err);
        return EMPTY;
      })
    ).subscribe({
      next: item => {
        this.updateDataSource(item!);
      },
      complete: () => console.log('Listening for changes to cart items'),
    });
  }
  
  updateDataSource(item: DisplayCartItem) {
    // Check if item already exists in the data source
    let currentItems = this.cartItemsSubject.value.filter(i => i.cartItemId !== item.cartItemId);
    currentItems.push(item);
    this.cartItemsSubject.next(currentItems);  // Update the BehaviorSubject with new state
  }

  update(cartItem: CartItem) {
    return this.afs.collection<CartItem>(this.collectionName).doc(cartItem.id).set(cartItem);
  }

  delete(id: string) {
    return this.afs.collection<CartItem>(this.collectionName).doc(id).delete();
  }
}
