import {MenuItem} from "./MenuItem";
export interface Category {

  displayOrder: number;
  name: string;
  description: string;
  visible: boolean;
  objectId: string;
  menuItems: MenuItem[];
}
