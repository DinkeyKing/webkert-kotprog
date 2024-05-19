import { Timestamp } from "@angular/fire/firestore"
import { PurchasedItem } from "./PurchasedItem"

export interface Purchase {
    id : string
    userId : string
    purchasedItemIds : string[]
    address : string
    date : Timestamp
}

export interface DisplayPurchase extends Purchase {
    items: PurchasedItem[];
}