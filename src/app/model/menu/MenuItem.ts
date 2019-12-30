import {Price} from "./Price";
import {OptionGroup} from "./OptionGroup";
export interface MenuItem {

  picture: string;
  prices: Price[];
  menuItemImage:any;
  description: string;
  displayOrder: number;
  name: string;
  objectId: string;
  optionGroups: OptionGroup[];
  minTotalOrderAmount: number;
}
