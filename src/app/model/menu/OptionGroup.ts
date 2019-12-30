import {Option} from "./Option";
import { PriceQty } from "./PriceQty";

export class OptionGroup {
  objectId: string;
  amount: number;
  maxAmount: number;
  options: Option[];
  name: string;
  enableMultiplier: boolean;
  defaultValues: number[];
  appliesToPrices: any[];
  priceQty: PriceQty[];
}
