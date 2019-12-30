import {Component, EventEmitter, Input, OnChanges, OnInit, Output, ElementRef, NgZone, ViewChild} from "@angular/core";
import {LocationDetail} from "../model/location/LocationDetail";
import {AddressService} from "../service/address.service";
import {ScheduleService} from "../service/schedule.service";
import {Router, NavigationEnd} from "@angular/router";
//import {DateFormatter} from "@angular/common/src/pipes/intl";
// import { DateFormatter } from "assets/script/intl";
import { DatePipe } from '@angular/common';
import {NgbDatepickerConfig, NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {LocationUtil} from "../util/LocationUtil";
import {SCHEDULE_PERIOD} from "../config/global-config";
import {GlobalScopeService} from "../service/global-scope.service";
import { Order } from "../model/Order/Order";
import { DeliveryCostCalculateService } from "../service/delivery-cost-calculate.service";
import * as moment from 'moment';


@Component({
  selector: 'app-location-detail',
  templateUrl: '../template/location-summary.component.html',
  styleUrls: ['../style/location-summary.component.css']
})
export class LocationSummaryComponent implements OnInit {

  @ViewChild('locationSummaryModal') locationSummaryModal;
  @ViewChild("orderTimeOut") orderTimeOut; 
  @ViewChild('switchDeliveryToPickupPopup') switchDeliveryToPickupPopup;

  @Input()
  locations: LocationDetail[];
  @Output()
  locationSelected: EventEmitter<LocationDetail>;
  private timeInterval: Array<string>;
  private selectedTime: string;
  private model: any;
  private selectedLocation: LocationDetail;
  private selectedSchedule: any;
  private selectedScheduleAddress: string;
  private selectedScheduleDistance: number;
  private timeScheduleMap: Map<string, any>;
  private loading: boolean;
  private cateringMenuId: string;
  private activeTabId: string = "pickup"; //the pickup tab is default
  address: Object;
  private order: Order;
  private googlePlaceId: string;
  private googleDescription: string;
  private googleLatitude: number;
  private googleLongitude: number;
  private deliveryCostResponse: any;
  private errorMessage:string;
  private deliveryGMSPostalCode : number;
  private deliveryGMSAdminArea : string;
  private deliveryGMSLocality : string;
  private hideShowDiv : boolean = true;
  private sortedLocations:LocationDetail[];
  private locationSummaryRef : NgbModalRef;
  private isAddress: boolean = false;
  private hasError:string;


  getAddress(place: Object) {
    if(place['types']!=null || place['types']!=undefined){
    if (place['types'].indexOf("street_address")>= 0 || place['types'].indexOf("premise")>= 0){
        this.address = place['formatted_address'];
        this.isAddress=true;
        this.googlePlaceId = place['place_id'];
        this.googleDescription="";
        this.deliveryGMSLocality="";
        this.deliveryGMSAdminArea="";
        this.deliveryGMSPostalCode=null;

        for (let i=0; i<place['address_components'].length; i++){
          for (let j=0; j<place['address_components'][i].types.length; j++){
          if(place['address_components'][i].types[j]=='street_number'){
            this.googleDescription = place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='route'){
            this.googleDescription += " " + place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='sublocality'){
            this.deliveryGMSLocality = place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='locality'){
            this.deliveryGMSLocality += " " + place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='administrative_area_level_2'){
            this.deliveryGMSAdminArea = place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='administrative_area_level_1'){
            this.deliveryGMSAdminArea += " " + place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='country'){
            this.deliveryGMSAdminArea += " " + place['address_components'][i].long_name;
          }
          if(place['address_components'][i].types[j]=='postal_code'){
            this.deliveryGMSPostalCode = place['address_components'][i].long_name;
          }
         }
        }
  
        this.googleLatitude = place['geometry'].location.lat();
        this.googleLongitude = place['geometry'].location.lng();
        this.getDeliveryCost();
        this.hasError="ng-valid";
    } 
   }
   else {
          this.deliveryCostResponse.deliveryTotal=null;
          this.deliveryCostResponse.deliveryMinimumAmt=null;
          //the place that the user entered is not a street address 
          // show an error message
          this.errorMessage="Please enter a valid street address";
          this.hasError="custm_error";
        }
  }

  constructor(private _addressService: AddressService, private _scheduleService: ScheduleService, private router: Router, 
    private modalService: NgbModal, datePickerConfig: NgbDatepickerConfig, public _gs: GlobalScopeService, 
    private _deliveryCostService: DeliveryCostCalculateService, private zone: NgZone) {
    
    this.locations = [];
    this.locationSelected = new EventEmitter<LocationDetail>();
    this.timeScheduleMap = new Map<string, any>();
    let now: Date = new Date();
    datePickerConfig.minDate = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
    now.setDate(now.getDate() + SCHEDULE_PERIOD);
    datePickerConfig.maxDate = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
    this.loading = false;
    this.deliveryCostResponse ={};
    this.sortedLocations=[];
    this.errorMessage="";
  }


  ngOnChanges(changes) {
    if (this.locations != null){

      for (let i: number = 0; i < this.locations.length; i++) {
        this.sortedLocations.push(this.locations[i]);
    }

    setTimeout(()=>{   //<<<---    using ()=> syntax
      this.locations = this.sortedLocations.sort((a, b) => {
                   return a.distance > b.distance ? 1 : -1;
                 });     
    },100);

    }
  }


  ngOnInit() {
    this.order = new Order();  

    if(this._gs.LOCATIONS.length==1 && !this._gs.LOCATIONS[0].bulkMenuHeader){
       this.openPopup( this.locations[0], this.locationSummaryModal, false);
    }
  
    // this.locations=  this.sortedLocations.sort((a, b) => {
    //        return a.distance > b.distance ? 1 : -1;
    //      });     

    // if (this.locations != null){
    //   this.setAddress();  
    // }

    if(this._gs.getCartState==true)
    {
      this._gs.toogleCartState();
      this._gs.IS_SCROLL_HIDE=false;
    }
  
  }
//   XMLHttpRequestUpload
//   private setAddress() {
//     for (let i: number = 0; i < this.locations.length; i++) {
//       if (this.locations[i].lastLocation == null)
//         continue;
//       this._addressService.getAddress(this.locations[i].lastLocation.latitude, this.locations[i].lastLocation.longitude).subscribe(response => {
//         this.locations[i].address = response;
//       });
    
// //       navigator.geolocation.getCurrentPosition(position => {
// //         this.locations[i].distance = this._addressService.getDistance(position.coords.latitude, position.coords.longitude, this.locations[i].lastLocation.latitude,                         this.locations[i].lastLocation.longitude);

//         // this.locations.sort((a, b) => {
//         //   return a.distance > b.distance ? 1 : -1;
//         // });
//     }
//   }

  private onSelection(location: LocationDetail) {
    this.locationSelected.emit(location);
  }

  private openPopup(location: LocationDetail, locationSummaryModalTemplate, isCatering: boolean) {
    //clear out any previously entered address information for delivery
    this.address = "";
    this.errorMessage="";

    if (isCatering) {
      this.cateringMenuId = location.bulkMenuHeader.objectId;
    } else {
      this.cateringMenuId = null;
    }    
    if (new LocationUtil(this._gs).isReadOnlyMenu(location)) {
      this.showMenuReadOnly(location);
      return;
    }
    this.selectedLocation = location;
    let now: Date = new Date();
    this.model = {};
    this.model.day = now.getDate();
    this.model.month = now.getMonth() + 1;
    this.model.year = now.getFullYear();
    this.onDateSelected(false);

    if(this.selectedLocation.delivery.enabled){
      //Removed by AR - Force teh user to type in the address rather then try to default
      // this.loading = true;
      // navigator.geolocation.getCurrentPosition(position => {
      //   this._addressService.getCurrentAddress(position.coords.latitude, position.coords.longitude).subscribe(response => {
      //     this.address=response.results[0].formatted_address;
      //     this.googlePlaceId=response.results[0].place_id;
      //     this.googleDescription=response.results[0].address_components[1].long_name;
      //     this.googleLatitude=response.results[0].geometry.location.lat;
      //     this.googleLongitude=response.results[0].geometry.location.lng;
      //     this.deliveryGMSLocality = response.results[0].address_components[3].long_name;
      //     this.deliveryGMSAdminArea = response.results[0].address_components[4].long_name;
      //     this.deliveryGMSPostalCode = response.results[0].address_components[6].long_name;
      //     //we should calculate the cost of delivery since we have a valid location
      //     this.getDeliveryCost();
      //   });
      // });
      this._gs.DELIVERY_ENABLED = this.selectedLocation.delivery.enabled;
    }

    this.locationSummaryRef = this.modalService.open(locationSummaryModalTemplate);
    //set this modal to the currently active one
    this._gs.activeModal = this.locationSummaryRef;

    this.locationSummaryRef.result.then((result) => {
      this.showMenu(this.selectedSchedule, result);
    }, (reason) => {
      this.reset();
      this.resetDeliveryText();
      this.order = new Order();
      //user is cancelling this current order, let GS know
      this._gs.onOrderCancel(false);
    });
}

  private buttonState(): boolean {
    return this.selectedTime == null;
  }

  private getButtonText(location: LocationDetail) {
    return new LocationUtil(this._gs).getButtonText(location);
  }

  private getCateringButtonText(location: LocationDetail){
    return new LocationUtil(this._gs).getCateringButtonText(location);
  }

  private getStatus(location: LocationDetail) {
    return new LocationUtil(this._gs).getStatus(location);
  }

  private onTimeSelection(time: string) {
    this.selectedTime = time;
    if((( this.address != null && this.address != '') && !this.errorMessage) && this.timeInterval.length != 0)
      {
        this.getDeliveryCost();
      }
    this.selectedSchedule = this.timeScheduleMap.get(this.selectedTime);
    if (this.selectedSchedule == null || this.selectedSchedule.locationData == null)
      return;
    this._addressService.getAddress(this.selectedSchedule.locationData.lat, this.selectedSchedule.locationData.lng).subscribe(response => {
      this.selectedScheduleAddress = response;
    });
    navigator.geolocation.getCurrentPosition(position => {
      this.selectedScheduleDistance = this._addressService.getDistance(position.coords.latitude, position.coords.longitude, this.selectedSchedule.locationData.lat, this.selectedSchedule.locationData.lng);
    });
  }

  private splitTime(schedule: any, selectionStartDate: Date, selectionEndDate: Date, offset : number) {
    let scheduleStartDate: Date = new Date(schedule.startDateTime.iso);
    let scheduleEndDate: Date = new Date(schedule.endDateTime.iso);
    // let rightNowDate: Date = new Date();
    let rightNowMoment: moment.Moment = moment();
    let scheduleStartMoment : moment.Moment = moment(scheduleStartDate);
    let scheduleEndMoment : moment.Moment = moment(scheduleEndDate);
    
    var diffInMins = scheduleStartMoment.diff(rightNowMoment, "minutes");
    if (diffInMins < offset){
      scheduleStartMoment.add((offset - diffInMins), "minutes");
      //now make sure that the new scheduleStartDate is not after the end date
      if (scheduleStartMoment.isAfter(scheduleEndMoment)){
        return;
      };
      //set the start date to the offset start date time
      scheduleStartDate = scheduleStartMoment.toDate();
    }

    if (scheduleStartDate < selectionStartDate)
      scheduleStartDate = selectionStartDate;
    if (scheduleEndDate > selectionEndDate)
      scheduleEndDate = selectionEndDate;
    scheduleStartDate.setMinutes(Math.ceil(scheduleStartDate.getMinutes() / 10) * 10);
    // let date: string = DateFormatter.format(new Date(scheduleStartDate), navigator.language, 'hh:mm a');

    var localeMoment = moment(new Date(scheduleStartDate)).locale(navigator.language);
    
    let date: string = localeMoment.format('hh:mm a');
    this.timeInterval.push(date);
    this.timeScheduleMap.set(date, schedule);
    while (scheduleEndDate.getTime() > scheduleStartDate.getTime()) {
      scheduleStartDate.setTime(scheduleStartDate.getTime() + (10 * 60 * 1000));
      // date=localeMoment.format('hh:mm a');
      date = moment(scheduleStartDate).format('hh:mm a');
      this.timeInterval.push(date);
      this.timeScheduleMap.set(date, schedule);
    }
  }
  private getTimeffsetForSelectedLocation(){
    //based on the currently selected location
    //and the current order type (delivery or pickup)
    //get the offset
    if (this.activeTabId == 'pickup'){
      return this.selectedLocation.pickupOffset;
    } else {
      return this.selectedLocation.deliveryOffset;
    }
  }

  private onOrderTypeTabChange(event, activeTabId: any){
    // console.log(event);
    this.activeTabId = event.nextId;

    if(this.isAddress && event.nextId=="pickup"){
        this.modalService.open(this.switchDeliveryToPickupPopup,{ windowClass: 'dark-modal' }).result.then((result) => {
          this.resetDeliveryText();
        }, (reason) => {
          activeTabId.activeId=event.activeId;
          this.activeTabId = activeTabId.activeId;
        });
       }

    //by triggering this event we re-load the schedule and 
    //re-calculate the ordering offset to ensure that the user does not order
    //without the appropriate notice.
    this.onDateSelected(true); 
  }

  private resetDeliveryText() {
    this.address="";
    this.isAddress=false;
    this.order.customerName="";
    this.order.customerPhone="";
    this.order.additionalInstruction="";
    this.order.apartmentNumber="";
    this.deliveryCostResponse.deliveryTotal=null;
    this.deliveryCostResponse.deliveryMinimumAmt=null;
  }

  private showMenu(schedule: any, isPickedOrDelivery: boolean) {
    let menuId: string;
    if (schedule.overrideMenu != null) {
      menuId = schedule.overrideMenu.objectId;
    } else {
      menuId = schedule.truck.menuHeader.objectId;
    }
    let truckId: string = schedule.truck.objectId;
    if(isPickedOrDelivery){
      this._gs.PICKUP_LATITUDE = schedule.locationData.lat;
      this._gs.PICKUP_LONGITUDE = schedule.locationData.lng;
      this._gs.PICKUP_LOCATION_ID = truckId;
      this._gs.PICKUP_ADDRESS = this.selectedScheduleAddress;
      this._gs.PICKUP_LOCATION_NAME = schedule.truck.name;
      this.order.isPickedOrDelivery=isPickedOrDelivery;
      this._gs.globalOrder=this.order;
    }
    else{
      this._gs.DELIVERY_ADDRESS = this.address;
      this._gs.DELIVERY_DESCRIPTION=this.googleDescription;
      this._gs.DELIVERY_LATITUDE=this.googleLatitude;  
      this._gs.DELIVERY_LONGITUDE=this.googleLongitude;
      this._gs.DELIVERY_PLACE_ID=this.googlePlaceId;
      this._gs.DELIVERY_GMS_ADMIN_AREA=this.deliveryGMSAdminArea;
      this._gs.DELIVERY_GMS_LOCALITY=this.deliveryGMSLocality;
      this._gs.DELIVERY_GMS_POSTAL_CODE=this.deliveryGMSPostalCode;
      this.order.isPickedOrDelivery=isPickedOrDelivery;
      this.order.deliveryCost=parseFloat(this.deliveryCostResponse.deliveryCost);
      this.order.deliveryTax=parseFloat(this.deliveryCostResponse.deliveryTax);
      this._gs.globalOrder=this.order;
    }

    //store the truck/restaurant that is being ordered from
    this._gs.selectedLocation = this.selectedLocation;
    
    if(schedule.truck.ageVerify){ 
      this._gs.AGE_VERIFICATION=schedule.truck.ageVerify;
    }
    else{
      this._gs.AGE_VERIFICATION=false;
      }
    let date: Date = new Date();
    date.setFullYear(this.model.year, this.model.month - 1, this.model.day);
    let parts = this.selectedTime.match(/(\d+)\:(\d+) (\w+)/);
    let hours: number = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10);
    let minutes: number = parseInt(parts[2], 10);
    //set to 24 hour clock if PM
    if ((parts[3] == "PM" || parts[3] == "pm") && hours < 12)
      hours = hours + 12;

    // if (parts[3] == "AM")
    //   hours = hours + 12;
      
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    this._gs.PICKUP_TIME = date;
    this.launchMenu(menuId, truckId, 0);

    if(this._gs.order!==null||this._gs.order!==undefined)
    {
      this._gs.order=[];
    }
  }

  private showMenuReadOnly(location: LocationDetail) {
    this.launchMenu(location.menuHeader.objectId, location.objectId, 1);
  }

  private launchMenu(menuId: string, locationId: string, mode: number) {
    if (this.cateringMenuId != null)
    {
      menuId = this.cateringMenuId;
    }
    this._gs.MENU_ID=menuId;
    if(this._gs.SOURCE_ID){
      this._gs.IS_MENU_CLASS_VISIBLE=false;
      this.router.navigate(['/menu', {menuId: menuId, locationId: locationId, mode: mode}], {queryParams: {sourceId: this._gs.SOURCE_ID}, skipLocationChange:true});
    }
    else{
      this._gs.IS_MENU_CLASS_VISIBLE=false;
      this.router.navigate(['/menu', {menuId: menuId, locationId: locationId, mode: mode}], {skipLocationChange:true});
    }
  }

  private reset() {
    this.timeScheduleMap.clear();
    this.timeInterval = [];
    this.selectedTime = null;
    this.selectedSchedule = null;
    this.selectedScheduleAddress = null;
    this.selectedScheduleDistance = null;

  }

  private onDateTimeSelectionCancel(){
    console.log('cancelled!');
  }

  private onDateSelected(isHideOrShow:boolean) {
    this.hideShowDiv=isHideOrShow;
    this.loading = true;
    this.reset();
    let startDate: Date = new Date();
    let endDate: Date = new Date();
    if (startDate.getFullYear() != this.model.year
      || startDate.getMonth() + 1 != this.model.month
      || startDate.getDate() != this.model.day)
      startDate.setHours(0, 0, 0, 1);
    endDate.setHours(23, 59, 59, 0);
    startDate.setFullYear(this.model.year, this.model.month - 1, this.model.day);
    endDate.setFullYear(this.model.year, this.model.month - 1, this.model.day);
    this._scheduleService.getSchedule(this.selectedLocation.objectId, startDate, endDate).subscribe(response => {
      response.sort((a: any, b: any) => {
        let startDate1: Date = a.startDateTime.iso;
        let startDate2: Date = b.startDateTime.iso;
        if (startDate1 < startDate2) {
          return -1;
        }
        if (startDate1 > startDate2) {
          return 1;
        }
        return 0;
      });
      //offset is the minimum number of minutes where the order can be places
      //its to stop people for placing an order for RIGHT NOW
      var offSet = this.getTimeffsetForSelectedLocation();
      for (let schedule of response) {
        this.splitTime(schedule, startDate, endDate, offSet);
      }
      if(this.timeInterval.length==0){
        this.deliveryCostResponse = [];
      };

      this.onTimeSelection(this.timeInterval[0]);

      if (this._gs.userTimeout)
        window.clearTimeout(this._gs.userTimeout);
      
        if (this.timeInterval.length > 0){
        this._gs.userTimeout = window.setTimeout(() => {
          this._gs.onOrderCancel(true); //true = close any currently open popups
          let options={backdrop: false, keyboard: false};
          //display the timeout message to the user  
          this.modalService.open(this.orderTimeOut, options).result.then(() => {
            
            //time out has occurred, cancel the order
            if (this.router.url != "/locationselection"){
              this.router.navigate(['/locationselection',{}], {queryParams: {sourceId: this._gs.SOURCE_ID}, skipLocationChange:true});
            };
            // } else {
            //   //we are all ready on the location selection screen
            //   //if the popup is all ready open then refresh it
            //   if (this.locationSummaryRef)
            //     this.onDateSelected(isHideOrShow);
            // };
            // if (this._gs.activeModal)
            //   this.onDateSelected(isHideOrShow); //if we are all ready there, just refresh the currently selected time

              
            
          });
        }, (60000*5));  //5 minute timeout
        
      }
      this.loading = false;
    });
  }

  private getDeliveryCost(){
    this.loading = true;
    this.errorMessage = "";
     let date: Date = new Date();
     date.setFullYear(this.model.year, this.model.month - 1, this.model.day);
     if(this.selectedTime != null){
      let parts = this.selectedTime.match(/(\d+)\:(\d+) (\w+)/);
      let hours: number = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12;
      let minutes: number = parseInt(parts[2], 10);
      if (hours == 24)//above logic has a bug in it where 12pm is parsed as midnight, correct this
        hours = 12;

      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0); //ignore seconds by setting to zero
     }
     let data={truckId : this.selectedLocation.objectId, deliveryDateTime : date, deliveryAddress : { googlePlaceId: this.googlePlaceId, address: this.address, description: this.googleDescription, lat: this.googleLatitude, long: this.googleLongitude}  }
     this._deliveryCostService.getDeliveryCostAmount(data).subscribe(response =>{

          this.zone.run(() => {
            this.deliveryCostResponse = response;
            this.deliveryCostResponse.deliveryTotal = this.deliveryCostResponse.deliveryCost + this.deliveryCostResponse.deliveryTax;
            this.loading = false;
           });

     }, httpError =>{
      console.log(httpError);
      //probably should show an error message to the user
      var err = JSON.parse(httpError._body).error;
      if (err && err.message)
        this.errorMessage = err.message
      else
        this.errorMessage = 'Delivery Cost could not be calculated. Please try again.';
      this.loading = false;
     });
  }

  launchLocationMap(location: LocationDetail){

    var aUrl:string;
    aUrl = "https://www.google.com/maps/dir/?api=1&dir_action=navigate&destination="
      + location.lastLocation.latitude + "," + location.lastLocation.longitude;
    
    window.open(aUrl, "_blank");
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
