import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DisplayPurchase, Purchase } from '../../shared/models/Purchase';
import { PurchaseService } from '../../shared/services/purchase.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss'
})
export class PurchasesComponent {
  
  //purchases$!: Observable<DisplayPurchase[]>;
  purchases! : DisplayPurchase[]
  private destroy$ = new Subject<void>();
  subscription? : Subscription
  successMessage : string = ""
  errorMessage : string = ""

  constructor(private purchaseService: PurchaseService, private cdr: ChangeDetectorRef) {}

  // ngOnInit(): void {
  //   const user = JSON.parse(localStorage.getItem('userObject') || '{}');

  //   if (!user){
  //     console.error('User not found!');
  //   }

  //   this.purchases$ = this.purchaseService.getUserPurchasesWithDetails(user.id);
  // }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    const user = JSON.parse(localStorage.getItem('userObject') || '{}');

    this.subscription?.unsubscribe();

    this.subscription = this.purchaseService.getUserPurchasesWithDetails(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: purchases => {
          this.purchases = purchases
          this.cdr.detectChanges();
          console.log(this.purchases);
          
        },
        error: err => console.error('Failed to load purchases:', err)
      });
  }

  // onDeletePurchase(purchaseId: string): void {
  //   const subscription = this.purchaseService.deletePurchaseAndItems(purchaseId).subscribe({
  //     next: () => {
  //       console.log('Purchase and related items deleted successfully');
  //       const user = JSON.parse(localStorage.getItem('userObject') || '{}');
  //       subscription.unsubscribe();
  //       this.purchases$ = this.purchaseService.getUserPurchasesWithDetails(user.id)
  //       // Optionally refresh the list or navigate away
  //     },
  //     error: (error) => {
  //       console.error('Error deleting purchase:', error);
  //       // Display an error message to the user
  //     }
  //   });
  // }

  onDeletePurchase(purchaseId: string): void {
    this.successMessage = "";
    this.errorMessage = "";

    this.subscription?.unsubscribe();
    this.purchases = []
    const subscription = this.purchaseService.deletePurchaseAndItems(purchaseId).subscribe({
      next: () => {
        subscription.unsubscribe();
        console.log('Purchase and related items deleted successfully');
        this.successMessage = "Successfully removed purchase!";
        this.loadData(); // Refresh the data
      },
      error: error => {
        console.error('Error deleting purchase:', error)
        this.errorMessage = 'Error deleting purchase:' + error;
        this.loadData(); // Refresh the data
      }
    });
  }
}
