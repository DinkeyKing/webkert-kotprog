import { CartItem } from "./CartItem"

export interface Purchase {
    id : string
    items : CartItem[]
    address : string
    date : Date
}