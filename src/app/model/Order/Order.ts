import {Item} from "./Item";
export class Order {

  customerPhone: string;
  zipCode: string;
  emailAddress: string;
  truckId: string;
  chargeTokenId: string;
  cc_expiry: string;
  credit_card_type: string;
  last4: string;
  saleMode: number = 2; //2 means online order
  items: Item[];
  grandTotal:number;
  tags: string = "TOGO";
  pickUpDateTime: string;
  customerName: string;
  notes: string;
  email: string;
  sourceId: string;
  apartmentNumber: string;
  additionalInstruction: string;
  deliveryCost: number;
  deliveryTax: number;
  isPickedOrDelivery: boolean;
  deliveryRequested: boolean;
  deliveryDetail: {};
  tipAmount : number;
  taxAmount: number;
}
