import { Properties } from "./Properties";

export class Option {
  description: string;
  price: number;
  id: number;
  qtyEnabled: boolean;
  default: boolean;
  properties: Properties[];
  get optionGroupId(){
    let tempArray = String(this.id).split('-');
    return tempArray[0];    
  };
}
