import { ApplicationRef, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisplayCartItem } from '../../shared/models/CartItem';
import { CartItemService } from '../../shared/services/cart-item.service';
import { MatTable } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseService } from '../../shared/services/purchase.service';
import { Purchase } from '../../shared/models/Purchase';
import { Timestamp } from '@angular/fire/firestore';
import { PurchasedItem } from '../../shared/models/PurchasedItem';
import { PurchasedItemService } from '../../shared/services/purchased-item.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {

  displayCartItems!: DisplayCartItem[];
  subscription! : Subscription;
  purchaseForm! : FormGroup;
  successMessage : string = "";
  errorMessage : string = "";
  canPurchase : boolean = true;

  @ViewChild(MatTable) table?: MatTable<any>;

  constructor(public cartService: CartItemService,
    private cdr: ChangeDetectorRef,
    private fb : FormBuilder,
    private purchaseService : PurchaseService,
    private purchasedItemService : PurchasedItemService
    ) {
    this.purchaseForm = fb.group({
      address : ['', Validators.required]
    })
  }

  ngOnInit(): void {
    console.log('Cart Init');

    this.canPurchase = true;

    const user = JSON.parse(localStorage.getItem('userObject') || '{}');

    if (!user){
      console.error('User not found!');
    }

    console.log(user.id);

    this.displayCartItems = []; // Clear existing items before new fetch
    this.cartService.getDisplayCartItems(user.id);

    this.cartService.cartItemsSubject.next(this.displayCartItems);  // Refresh array, this works apparently
  }

  ngAfterViewInit() {
    this.subscription = this.cartService.cartItems$.subscribe({
      next: items => {
        this.displayCartItems = items;
        this.cdr.detectChanges();  // Ensure the view is updated
        this.table?.renderRows();
        console.log('render' + items);
      },
      error: error => console.error('Failed to load cart items:', error)
    });
  }

  ngOnDestroy() {
    this.cartService.subscription?.unsubscribe();
    this.subscription?.unsubscribe();
    this.displayCartItems = [];

    //console.log('Cart Destroy');
    
  }

  deleteItem(cartItemId: string): void {
    this.cartService.delete(cartItemId).then( _ => {
        // Remove the item from the currentItems array
        const updatedItems = this.cartService.cartItemsSubject.value.filter(item => item.cartItemId !== cartItemId);
        this.cartService.cartItemsSubject.next(updatedItems);  // Update BehaviorSubject with the new state
        console.log('Item deleted successfully');
      }).catch((error : any) => {
        console.error('Failed to delete item:', error);
      });
  }

  trackByFn(index : any, item : any) {
    return item.carpetName; // Use a unique identifier from your item
  }

  onSubmit(){

    if (!this.canPurchase){
      console.error('Purchase already in progress!');
      return;
    }

    this.canPurchase = false;

    this.successMessage  = "";
    this.errorMessage = "";

    if (this.purchaseForm.invalid){
      console.error('Invalid purchase form!');
      this.errorMessage = 'Invalid purchase form!';
      return;
    }

    if (this.displayCartItems.length === 0){
      console.error('No items in cart');
      this.errorMessage = 'No items in cart';
      return;
    }

    const user = JSON.parse(localStorage.getItem('userObject') || '{}');

    if (!user){
      console.error('No user');
      return;
    }

    console.log(this.displayCartItems);

    const purchasedItemIds : string[] = [];
    this.displayCartItems.forEach(cartItem => {
      const id : string = this.purchasedItemService.generateId();
      purchasedItemIds.push(id);
      const purchasedItem : PurchasedItem = {
        id : id,
        carpetName : cartItem.carpetName,
        amount : cartItem.amount,
        price : cartItem.price
      }
      this.purchasedItemService.create(purchasedItem);
    });

    const purchase : Purchase = {
      id : '',
      userId : user.id,
      purchasedItemIds : purchasedItemIds,
      date : Timestamp.fromDate(new Date),
      address : this.purchaseForm.get('address')?.value
    }

    this.purchaseService.create(purchase).then(_ => {
      console.log('Purchase added!');
      this.successMessage = 'Succesful purchase!'

      this.cartService.deleteAllCartItemsForUser(user.id).subscribe({
        next: () => {
          console.log('All cart items deleted successfully after purchase');
          this.displayCartItems = []  // Delete displayed cart items
          this.canPurchase = true;
        },
        error: (error) => {
          console.error('Error deleting cart items after purchase:', error);
          this.errorMessage = 'Error deleting cart items after purchase:' + error.message
        }
      });

    }).catch(error => {
      console.error(error.message);
    });
  }
}
