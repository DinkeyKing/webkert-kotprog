import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CartItem, DisplayCartItem } from '../models/CartItem';
import { BehaviorSubject, Observable, catchError, combineLatest, defaultIfEmpty, filter, from, map, mergeMap, of, take, tap, toArray } from 'rxjs';
import { Carpet } from '../models/Carpet';

@Injectable({
  providedIn: 'root'
})
export class CartItemService {
  
  collectionName = 'CartItems';

  private cartItemsSubject = new BehaviorSubject<DisplayCartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

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
      .valueChanges()
      .pipe(
        map(cartItems => cartItems || []),  // Ensure that it returns an empty array if the result is null
      );
  }


  getDisplayCartItems(userId: string): void {
    this.getByUserId(userId).pipe(
      mergeMap(cartItems => from(cartItems)),
      mergeMap(cartItem =>
          this.afs.collection<Carpet>('Carpets').doc<Carpet>(cartItem.carpetId).valueChanges().pipe(
              take(1),
              map(carpet => carpet ? {
                  carpetName: carpet.name,
                  amount: cartItem.amount,
                  cartItemId : cartItem.id
              } : null),
              filter((item): item is DisplayCartItem => item !== null)
          )
      )
    ).subscribe({
        next: item => {
            let currentItems = this.cartItemsSubject.value;
            currentItems.push(item);
            this.cartItemsSubject.next(currentItems);
        },
        complete: () => {
            console.log('All items processed');
        }
    });
   }
  

  update(cartItem: CartItem) {
    return this.afs.collection<CartItem>(this.collectionName).doc(cartItem.id).set(cartItem);
  }

  delete(id: string) {
    return this.afs.collection<CartItem>(this.collectionName).doc(id).delete();
  }
}
