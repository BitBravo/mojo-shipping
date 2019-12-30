import { Properties } from "../menu/Properties";

export class OrderOption {
  id: string;
  removed: boolean;
  name: string;
  cost: number;
  qty: number;
  price: number;
  transparent: boolean;
  isDefault: boolean;
  // optionGroupId :string;
  get optionGroupId(){
    let tempArray = String(this.id).split('-');
    return tempArray[0];    
  };
  get optionUniqueIdentifier(){
    let tempArray = String(this.id).split('-');
    return tempArray[1];    
  };
  optionProperties: Properties[];
 
  constructor() {
    this.removed = false;
    this.qty = 1;
    this.optionProperties = [];
  }
}
