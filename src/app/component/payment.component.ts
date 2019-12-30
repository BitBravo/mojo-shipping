import { Component, ViewContainerRef, OnInit, NgZone, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { GlobalScopeService } from "../service/global-scope.service";
import { Order } from "../model/Order/Order";
import { OrderCreateService } from "../service/order-create.service";
import { PayGatewayFactory } from "../service/payGateway.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ManifestGetService } from "../service/manifest-get.service";
// import { Overlay } from 'ngx-modialog';
// import { Modal } from 'ngx-modialog/plugins/bootstrap';

// declare var Heartland: any;

@Component({
  selector: 'app-payment',
  templateUrl: '../template/payment.component.html',
  styleUrls: ['../style/payment.component.css']
})

export class PaymentComponent implements OnInit {
  public paymentGateway: any;
  // private heartland: any;
  private order: Order;
  private cardNumber: number;
  private cardCVV: number;
  private cardMonth: number;
  private cardYear: number;
  private zipCode: string;
  public loading: boolean;
  private errorMessage: string;
  private errorMsg: string;
  private isVerified: boolean=false;
  public deliveryOrder: Order;
  public token: boolean;
  public isChecked: boolean;

  @ViewChild('errorMessagePopup') errorMessagePopup;
  
  constructor(private modalService: NgbModal, private router: Router, public globalScopeService: GlobalScopeService, private orderCreateService: OrderCreateService, private zone: NgZone, private _manifestGetService: ManifestGetService) {
    this.globalScopeService.IS_SCROLL_HIDE=false;
    this.deliveryOrder=this.globalScopeService.globalOrder;
    this.token = false;
  }

  ngOnInit() {
    let self = this;
    this.order = new Order();
    if(this.deliveryOrder.isPickedOrDelivery==false){
      this.order.customerName=this.deliveryOrder.customerName;
      this.order.customerPhone=this.deliveryOrder.customerPhone;
      }
    this.order.items = this.globalScopeService.order;
    this.order.truckId = this.globalScopeService.PICKUP_LOCATION_ID;
    this.order.tipAmount = this.globalScopeService.tipAmount;
    
    if (this.globalScopeService.PICKUP_TIME instanceof Date) {
      this.order.pickUpDateTime = this.globalScopeService.PICKUP_TIME.toUTCString()
    }
    else {
      this.order.pickUpDateTime = (new Date(this.globalScopeService.PICKUP_TIME)).toUTCString();
    }
    this.loading = false;

    //create a payment gateway instance
    this.paymentGateway = new PayGatewayFactory().getGatewayInstance(this.globalScopeService, 
      function(aToken: string, last4:string, cc_expiry:string, card_type:string){
        self.onTokenSuccess(aToken, last4, cc_expiry, card_type);
      },
      function(error: any){
        self.onTokenError(error);
      },this._manifestGetService);

     this.paymentGateway.init();
    }


  doCheckOut(){
    this.loading = true;
    this.paymentGateway.generateToken(this);
  };

  private onTokenSuccess(aToken: string, last4: string, cc_expiry: string, card_type: string){
    // console.log('TOKEN Success: ' + aToken + ' last 4 is ' + last4);
    let self=this;
    this.order.last4 = last4;
    this.order.chargeTokenId = aToken;
    this.order.cc_expiry = cc_expiry;
    this.order.credit_card_type = card_type;
    if(this.globalScopeService.SOURCE_ID){
    this.order.sourceId=this.globalScopeService.SOURCE_ID;
    }
    if (this.zipCode)
      this.order.zipCode = this.zipCode.toString();
    if(this.deliveryOrder.isPickedOrDelivery==false){
      this.order.deliveryRequested = this.globalScopeService.DELIVERY_ENABLED;
      this.order.deliveryDetail={
        deliveryName : this.order.customerName,
        deliveryLat : this.globalScopeService.DELIVERY_LATITUDE,
        deliveryLong : this.globalScopeService.DELIVERY_LONGITUDE,
        deliveryGMSLocality : this.globalScopeService.DELIVERY_GMS_LOCALITY,
        deliveryComments : this.deliveryOrder.additionalInstruction,
        deliveryAmount : this.deliveryOrder.deliveryCost,
        deliveryAddress : {googlePlaceId : this.globalScopeService.DELIVERY_PLACE_ID, address : this.globalScopeService.DELIVERY_ADDRESS, description : this.globalScopeService.DELIVERY_DESCRIPTION },
        deliveryApt : this.deliveryOrder.apartmentNumber,
        deliveryTax : this.deliveryOrder.deliveryTax,
        deliveryPhone : this.order.customerPhone,
        deliveryEmail: this.order.emailAddress,
        deliveryGMSPostalCode : this.globalScopeService.DELIVERY_GMS_POSTAL_CODE,
        deliveryGMSAdminArea : this.globalScopeService.DELIVERY_GMS_ADMIN_AREA,
      } 
    }
    //prepend customer name to any existing notes
    if (this.order.notes)
      this.order.notes = this.order.customerName + ':' + this.order.notes;
    else
      this.order.notes = this.order.customerName;

    //OK we have the token, we just need to do a few more validation and 
    //then we submit to the server
    if (this.globalScopeService.AGE_VERIFICATION == true && !this.isVerified) {
      this.zone.run(() => {
      self.loading = false;
      this.errorMessage = "Please verify that you are over 21.";
     });
    }
    else {
      //before we submit the order, lets run through all the items and remove 
      //any transparent options as they should not be sent to the server
      //transparent options are options that are marked as default and have not been modified in any way
      //since Mojo does not print/show default options there is no need to send them or store them
      for (let aOrderItem of this.order.items){
        let optionArray = [];
        //for each item, loop through the options
        for (let anOption of aOrderItem.options){
          if (anOption.transparent == false || !anOption.transparent){
            optionArray.push(anOption)
          }
        };
        //update the order item with the revised options (should not contain transparent options)
        aOrderItem.options = optionArray;
      };

      this.orderCreateService.createOrder(this.order).subscribe(response => {
       
        this.globalScopeService.ORDER_POST_RESPONSE = response;
        //order has been succesfully placed
        this.globalScopeService.onOrderComplete();
        
        if(this.globalScopeService.SOURCE_ID){
          this.router.navigate(['/create'], { queryParams: { sourceId: this.globalScopeService.SOURCE_ID }, skipLocationChange:true });
        }
        else {
          this.router.navigate(['/create'], {skipLocationChange:true});
        }
        self.loading = false;
      },
      httpError =>{
        console.log(httpError);
        //probably should show an error message to the user
        var err = JSON.parse(httpError._body).error;
        if (err && err.message)
          this.errorMsg = err.message;
        else
          this.errorMsg = 'Unexpected error has occurred. Please try again later';
        
          this.zone.run(() => {
            self.loading = false;
            this.modalService.open(this.errorMessagePopup);
           });
       });
    }
  }
  
  private onTokenError(errorResponse: any) {
    this.zone.run(() => {
      if(errorResponse.error==undefined){
        this.errorMsg = errorResponse.message;
      }else{
        this.errorMsg = errorResponse.error.message;
      }

      this.zone.run(() => {
        this.loading = false;

        if(errorResponse.error==undefined){
          this.modalService.open(this.errorMessagePopup).result.then((result) => {

          }, (reason) => {
                     //Get the manifest and deviceId
        this._manifestGetService.GetManifest().subscribe(response => {  
          console.log(response);
          this.globalScopeService.MANIFEST = response['manifest'];
          this.globalScopeService.DEVICE_ID = response['deviceId'];          
          this.generateScript();
          this.isChecked=false;
          this.token=false;
      });
           });
        }else{
          this.modalService.open(this.errorMessagePopup);
        }
       });
    });
  }


  generateScript() {
    var list = document.getElementsByTagName('script');
    var i = list.length, flag = false;
    while (i--) {
        if (list[i].src === "https://stagegw.transnox.com/transit-tsep-web/jsView/" + this.globalScopeService.DEVICE_ID + "?" + this.globalScopeService.MANIFEST) {
            flag = true;
            
            var id=document.getElementById('tsys');
                id.remove();

            // var functionId = document.getElementById('tsysfunction');
            //     functionId.remove();

            var tag = document.createElement('script');
            tag.id="tsys";
            // tag.onload = function() {
            //    this.generateFunction();
            // }.bind(this);
            tag.src = "https://stagegw.transnox.com/transit-tsep-web/jsView/" + this.globalScopeService.DEVICE_ID + "?" + this.globalScopeService.MANIFEST;
            document.getElementsByTagName('head')[0].appendChild(tag);
        }
    }
    
    // if we didn't already find it on the page, add it
    if (!flag) {
        var tag = document.createElement('script');
        tag.id="tsys";
        // tag.onload = function() {
        //     this.generateFunction();
        //   }.bind(this);
        tag.src = "https://stagegw.transnox.com/transit-tsep-web/jsView/" + this.globalScopeService.DEVICE_ID + "?" + this.globalScopeService.MANIFEST;
        document.getElementsByTagName('head')[0].appendChild(tag);
    }
}



  private resetErrorMessage() {
    this.errorMessage = null;
  }

  private validateButton(event){
    this.loading=true;
     if(event.checked){
      setTimeout(()=>{   //<<<---    using ()=> syntax
        this.token=true;  
        this.isChecked=true; 
        this.loading=false;
      },3000);  
     }else{
       this.token=false;
     }
  }

  eventHandler(event: any) {
    //console.log(event, event.keyCode, event.keyIdentifier);
    let evt = (event) ? event : window.event;
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    let input: HTMLInputElement = (<HTMLInputElement>event.target);
    let text = input.value;
  
    text += String.fromCharCode(charCode);
    
    while (text.includes("-"))
    text = text.replace("-", "");

    while (text.includes("/"))
    text = text.replace("/", "");

    while (text.includes ("("))
    text = text.replace("(","");

    while (text.includes (")"))
    text = text.replace(")","");

    while (text.includes (" "))
    text = text.replace(" ","");
    
    if (charCode === 8) { // allowing backspace button
      return true;
    }
  
    else if(!this.RegExTest(text)){
       return false;
     }

    else if (charCode!=46 && (charCode < 48 || charCode > 57)) { // allowing only 0-9 number
      return false;
    }
 } 

  RegExTest(input):Boolean
  {
     return /^[0-9]*$/.test(input);
  }
}
