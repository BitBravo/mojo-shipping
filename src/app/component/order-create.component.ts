import {Component, OnInit} from "@angular/core";
import {GlobalScopeService} from "../service/global-scope.service";
import {Router} from "@angular/router";
import { Order } from "../model/Order/Order";

@Component({
  selector: 'app-order-create',
  templateUrl: '../template/order-create.component.html',
  styleUrls: ['../style/order-create.component.css']
})
export class OrderCreateComponent implements OnInit {

 
  private message: string;
  private orderTicket: string; // new change 
  private address : string;  // new change 
  private orderAmount: number; // new change 
  private pickUpTime: Date; // new change 
  private name: string;
  private deliveryComments: String;
  private deliveryApartmentNumber: string;
  public deliveryOrder: Order;
   

constructor(private globalScopeService: GlobalScopeService, private router: Router) {
  this.deliveryOrder=this.globalScopeService.globalOrder;
  }
  ngOnInit() {
    this.message = this.globalScopeService.ORDER_POST_RESPONSE.message;
    if(this.deliveryOrder.isPickedOrDelivery==false){
      this.address= this.globalScopeService.DELIVERY_ADDRESS;
      this.name= this.deliveryOrder.customerName;
      this.deliveryComments= this.deliveryOrder.additionalInstruction;
      this.deliveryApartmentNumber = this.deliveryOrder.apartmentNumber;
    }
    else{
    this.address = this.globalScopeService.PICKUP_ADDRESS; // new change 
  }
    this.orderAmount = this.globalScopeService.ORDER_AMOUNT ; // new change
    this.pickUpTime = this.globalScopeService.PICKUP_TIME ; // new change
    // console.log(this.globalScopeService.ORDER_POST_RESPONSE);  
  }
  private orderAgain() {
    if(this.globalScopeService.SOURCE_ID){
      this.router.navigate(['/locationselection'], { queryParams: { sourceId: this.globalScopeService.SOURCE_ID }, skipLocationChange:true });
    }
    else {
      this.router.navigate(['/locationselection'], {skipLocationChange:true});
    }
  }
}
