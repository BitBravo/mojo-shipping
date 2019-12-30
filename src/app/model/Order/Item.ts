import {OrderOption} from "./Option";
import { MenuItem } from "../menu/MenuItem";

export class Item {
  id: string;
  qty: number;
  priceText: string;
  name: string;
  options: OrderOption[] = [];
  minTotalOrderAmount: number;
  menuItem: MenuItem;
  constructor() {
    this.qty = 1;
  }
}
