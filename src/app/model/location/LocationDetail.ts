import {LastLocation} from "./Location";
import {BulkMenu} from "../BulkMenu";

export interface LocationDetail {
  objectId: string;
  name: string;
  currentStatus: string;
  lastLocation: LastLocation;
  address: string;
  distance: number;
  next7DayEvents: boolean
  menuHeader: any;
  bulkMenuHeader: BulkMenu;
  ageVerify: boolean;
  delivery: any;
  pickupOffset: number;
  deliveryOffset: number;
}
