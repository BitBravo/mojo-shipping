import {Component, OnInit, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Order} from "../model/Order/Order";
import {GlobalScopeService} from "../service/global-scope.service";
import {OrderCreateService} from "../service/order-create.service";
import {kioskSetting} from "../model/kios-setting";
import {KIOSK_PREF_KEY} from "../config/global-config";
import {Http} from "@angular/http";
import { Location } from '@angular/common';

@Component({
  selector: 'app-kiosk',
  templateUrl: '../template/kiosk.component.html',
  styleUrls: ['../style/kiosk.component.css']
})
export class KioskComponent implements OnInit {

  private order: Order;
  private email: string;
  private errorMessage: string;
  private paxURL: string;
  public loading: boolean;
  private paxResponseObject;

  @ViewChild("receiptpopup") confirmationPopup;
  @ViewChild("emailpopup") emailPopup;
  @ViewChild("emvReaderError") emvReaderError;

  private decimalToHex(number, padding){
    //convert to hex
    var hex = Number(number).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    //pad if necessary
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
  };
  private calculateLrc(inputString){

    // var lrc = 0;
    // // Get hex checksum.
    // for (var i = 0; i < inputString.length; i++) {
    //   var charCode = inputString.charCodeAt(i);
    //   //perform bitwise xor
    //   lrc ^= charCode;
    // };
    // return lrc.toString(16);

    //convert string to hex
    var hex = '';
    for (var i=0; i<inputString.length; i++) {
      hex += this.decimalToHex(inputString.charCodeAt(i), 2); 
    }

    //now from hex to bytes
    var bytesArray = [];

    for (var i = 0; i < hex.length; i += 2)
      bytesArray.push(parseInt(hex.substr(i, 2), 16));
    
    var checksum = 0;

    //do bitwise OR
    for (var i=0; i < bytesArray.length; i++){
      checksum ^= bytesArray[i];
    };

    return String.fromCharCode(checksum);
  };

  private chargeCard(){
    console.log(this.order);
    var cents = this.order.grandTotal * 100; //convert amount to cents
    var payload = "T00\x1c" 
      + this.paxResponseObject.version 
      + "\x1c01\x1c" + cents + "\x1c\x1c1\x1c\x1c\x1c\x1c\x1c\x03";
    
    //now using the payload we calcualte the lrc
    var lrc = this.calculateLrc(payload);
    //now put the full request string together
    //[NSString stringWithFormat:@"\x02%@\x1c%@\x1c%@\x1c%i\x1c\x1c%@\x1c\x1c\x1c\x1c\x1c\x03%c",command,version,transtype,(int)cents,trace,lrc];
    var reqString = "\x02" + payload + lrc;

    //now base64 encode the request string
    var base64encodedRequest = window.btoa(reqString); 
    
    var self = this;
    // var initString = "AkEwMBwxLjI4A0s=";
    var targetUrl = self.paxURL + "?" + base64encodedRequest;
    console.info('calling ' + targetUrl);
    self._http.get(targetUrl).subscribe(response => {
      console.log(response);
      if (response.status == 200){
        //parse the response and get the info for the
        //createOrder service 
        this.orderCreateService.createOrder(this.order).subscribe(response => {
          this.globalScopeService.ORDER_POST_RESPONSE = response;
          this.router.navigate(['/create'], {skipLocationChange:true});
        });
      }
    }, error =>{
      console.error(error);
      //show generic error and go back
      self.modalService.open(self.emvReaderError).result.catch((result) => {
        this._location.back();
      });
    });

  };

  private getPAXInitResponse(paxString){
    var paxStringObject = String(paxString);
    
    console.log(paxStringObject.substring(0,1).charCodeAt(0));

    this.paxResponseObject = {
      status:paxStringObject.substring(1,2),
      command: paxStringObject.substring(3,6),
      version: paxStringObject.substring(7,11),
      responseCode: paxStringObject.substring(12,19),
      responseMessage: paxStringObject.substring(19,21),
      remainder: paxStringObject.substring(22) //extract the remainder of the string
    };
    return this.paxResponseObject;
  };

  private initializeDevice() {
    var self = this;
    // var initString = "AkEwMBwxLjI4A0s=";
    var targetUrl = self.paxURL + "?" + "AkEwMBwxLjI4A0s=";
    console.info('calling ' + targetUrl);
    return self._http.get(targetUrl);
  };

  constructor(private router: Router, private modalService: NgbModal, 
    private globalScopeService: GlobalScopeService,
    private orderCreateService: OrderCreateService, private _http: Http,
    private _location: Location) {
    this.order = new Order();
    this.order.items = this.globalScopeService.order;
    this.order.truckId = this.globalScopeService.PICKUP_LOCATION_ID;
    this.order.pickUpDateTime = this.globalScopeService.PICKUP_TIME.toUTCString();
    this.order.grandTotal = this.globalScopeService.getGrandTotal();
    let settings: kioskSetting = JSON.parse(localStorage.getItem(KIOSK_PREF_KEY));
    this.paxURL = "http://";
    if (settings.ssl)
      this.paxURL = "https://";
    this.paxURL = this.paxURL + settings.hostname;
    if (settings.port)
      this.paxURL = this.paxURL + ":" + settings.port + "/";
  }

  ngOnInit() {
    var self = this;
    this.loading = true;

    self.initializeDevice()
    .subscribe(response =>{
      // console.log(response.text());
      var paxResponse = self.getPAXInitResponse(response.text());
      console.log(paxResponse);
      if (paxResponse.responseCode == '000000')
        //ok now tell the PAX to charge the card
        self.chargeCard();
      else {
        //show generic error and go back
        self.modalService.open(self.emvReaderError).result.catch((result) => {
          this._location.back();
        });
      };
    }, err => { 
      console.log('Something went wrong!' + JSON.stringify(err));
      self.modalService.open(self.emvReaderError).result.catch((result) => {
        this._location.back();
      });
    }); 
    // .subscribe(response => {
    //   console.log(response);
    // });
    // self._http
    //   .get(self.paxURL + "?" + self.getPAXInitializationString() ).subscribe(response => {
    //   console.log(response);
    //   self._http
    //     .get(self.paxURL + "?AlQwMBwxLjI4HDAxHDEwMBwcMRwcHBwcA0M=").subscribe(response => {
    //     console.log(response);
    //     self.modalService.open(self.confirmationPopup).result.then((result) => {
    //       self.modalService.open(self.emailPopup).result.then((result) => {
    //         self.order.email = self.email;
    //         self.openconfirmation();
    //       }, (reason) => {
    //       });
    //     }, (reason) => {
    //       self.openconfirmation();
    //     });
    //   });
    // });
  }

  openconfirmation() {
    this.order.chargeTokenId = "123456";
    this.order.credit_card_type = "VISA";
    this.order.cc_expiry = 10 + '' + 17;
    this.order.last4 = "4242";
    this.order.notes = this.order.customerName;
    if(this.globalScopeService.SOURCE_ID){
      this.order.sourceId=this.globalScopeService.SOURCE_ID;
      }
    this.orderCreateService.createOrder(this.order).subscribe(response => {
      this.globalScopeService.ORDER_POST_RESPONSE = response;
      if(this.globalScopeService.SOURCE_ID){
        this.router.navigate(['/create'], { queryParams: { sourceId: this.globalScopeService.SOURCE_ID }, skipLocationChange:true });
      }
      else {
        this.router.navigate(['/create'],{skipLocationChange:true});
      }
    });
  }
}
