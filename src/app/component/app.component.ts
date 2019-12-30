import {Component, OnInit, ViewChild} from "@angular/core";
import {GlobalScopeService} from "../service/global-scope.service";
import {Router, NavigationEnd} from '@angular/router';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddressService} from "../service/address.service";
import {SESSION_TOKEN_PREF_KEY} from "../config/global-config";
import {VendorGetService} from "../service/vendor-get.service";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: '../template/app.component.html',
  styleUrls: ['../style/app.component.css']
})
export class AppComponent implements OnInit {

@ViewChild('offlinePopup') offlinePopup;

public locationPage:string="";  
private hideBackgroundScroll:string="";
public loading: boolean;

public setTitle( newTitle: string) {
  this.titleService.setTitle( newTitle );

  //iOs meta tag
  var metaTag = document.createElement('meta');
  metaTag.setAttribute('name', 'apple-mobile-web-app-title');
  metaTag.setAttribute('content', newTitle);
  document.head.insertBefore(metaTag, document.head.firstChild);  
}

constructor(public _globalScope: GlobalScopeService, private router: Router, private modalService: NgbModal, private _vendorGetService: VendorGetService, private titleService: Title,private _addressService: AddressService){
  
  this._globalScope.IS_SCROLL_HIDE=false;

  // window.addEventListener('online',  function () {
  //   alert("online");
  // });
  window.addEventListener('offline',  function () {
    let options={backdrop:false, keyboard:false, windowClass: 'dark-modal'};
    this.modalService.open(this.offlinePopup, options);
  }.bind(this));
  
  router.events.subscribe(event => {
    if (event instanceof NavigationEnd ) {
      if (event.url.startsWith("/locationselection")) {  // event.url has current url
        this.locationPage = "locationPage";
      } 
      else{
        this.locationPage = "";
      }
    }
  });

  if (localStorage.length != 0) {
    localStorage.removeItem('_globalOrder');
    localStorage.removeItem('_payInfo');
    localStorage.removeItem('_LOCATIONS');
    localStorage.removeItem('_KIOSK');
    localStorage.removeItem('_VENDOR_ID');
    localStorage.removeItem('_VENDOR_NAME');
    localStorage.removeItem('_VENDOR_LOGO_URL');
    localStorage.removeItem('_APPLICATION_ID');
    localStorage.removeItem('_BASE_URL');
    localStorage.removeItem('_PICKUP_LOCATION_ID');
    localStorage.removeItem('_PICKUP_TIME');
    localStorage.removeItem('_PICKUP_ADDRESS');
    localStorage.removeItem('_PICKUP_LATITUDE');
    localStorage.removeItem('_PICKUP_LONGITUDE');
    localStorage.removeItem('_PICKUP_LOCATION_NAME');
    localStorage.removeItem('_ORDER_AMOUNT');
    localStorage.removeItem('_order');
    localStorage.removeItem('_ORDER_POST_RESPONSE');
    localStorage.removeItem('_isoCurrency');
    localStorage.removeItem('_MENU_ID');
    localStorage.removeItem('_VIEW_MENU');
    localStorage.removeItem('_AGE_VERIFICATION');
    localStorage.removeItem('_MOJOWEBCSS');
    localStorage.removeItem('_SOURCE_ID');
    localStorage.removeItem('_DELIVERY_ADDRESS');
    localStorage.removeItem('_DELIVERY_DESCRIPTION');
    localStorage.removeItem('_DELIVERY_LATITUDE');
    localStorage.removeItem('_DELIVERY_LONGITUDE');
    localStorage.removeItem('_DELIVERY_PLACE_ID');
    localStorage.removeItem('_DELIVERY_ENABLED');
    localStorage.removeItem('_DELIVERY_GMS_POSTAL_CODE');
    localStorage.removeItem('_DELIVERY_GMS_ADMIN_AREA');
    localStorage.removeItem('_DELIVERY_GMS_LOCALITY');
    localStorage.removeItem('_MODE');
    localStorage.removeItem('_CATEGORY_ID');
    localStorage.removeItem('_CATEGORY');
    localStorage.removeItem('_MENU_ITEM_OPTION_GROUPS');
    localStorage.removeItem('_ARRAY_OF_CATEGORIES_ITEM');
    localStorage.removeItem('_IS_MENU_CLASS_VISIBLE');
    localStorage.removeItem('_TAX_AMOUNT');
    localStorage.removeItem('_IS_SCROLL_HIDE');
    localStorage.removeItem('_DEVICE_ID');
    localStorage.removeItem('_MANIFEST');
    localStorage.removeItem('Response');
  }
}

ngOnInit() {
  if(this._globalScope.MOJOWEBCSS!=null || this._globalScope.MOJOWEBCSS!=undefined){
     this.applyTheme(this._globalScope.MOJOWEBCSS);    
    }
}

private applyAppleTouchIcon(url:string){
  var link = document.createElement('link');
  link.setAttribute('rel', 'apple-touch-icon');
  link.href = url;
  document.head.insertBefore(link, document.head.firstChild);
};

private applyGenericIcon(url:string){
  var link = document.createElement('link');
  link.setAttribute('rel', 'icon');
  link.setAttribute('type', 'image/x-icon')
  link.href = url;
  document.head.insertBefore(link, document.head.firstChild);  
};

private applyTheme(url: string) {
  console.log('Applying CSS Theme for ' + url);
  var link = document.createElement('link');
  link.type = 'text/css';
  link.setAttribute('rel', 'stylesheet');
  link.href = url;
  // document.head.appendChild(link);
  document.head.insertBefore(link, document.head.firstChild);
}

  private loadVendorLocations(){
    if (navigator.onLine) {
    this.loading=true;
    this._vendorGetService.getVendor().subscribe(response => {
      console.log(response);
      if (response == null || response.vendorInfo == null || response.vendorInfo.paymentInfo == null || response.vendorInfo.paymentInfo.length == 0) {
        this.loading = false;
        return;
      }
            
      this._globalScope.LOCATIONS = response.truckList;

      for (let i: number = 0; i < this._globalScope.LOCATIONS.length; i++) {
        if(this._globalScope.LOCATIONS[i].lastLocation!=undefined){
        navigator.geolocation.getCurrentPosition(position => {
          this._globalScope.LOCATIONS[i].distance = this._addressService.getDistance(position.coords.latitude, position.coords.longitude, this._globalScope.LOCATIONS[i].lastLocation.latitude, this._globalScope.LOCATIONS[i].lastLocation.longitude);         
        });

        if (this._globalScope.LOCATIONS[i].lastLocation == null)
                continue;
          this._addressService.getAddress(this._globalScope.LOCATIONS[i].lastLocation.latitude, this._globalScope.LOCATIONS[i].lastLocation.longitude).subscribe(response => {
            this._globalScope.LOCATIONS[i].address = response;
          });
       }
      }

      this._globalScope.VENDOR_NAME = response.vendorInfo.description;
      this._globalScope.order=[];
      this._globalScope.payInfo = response.vendorInfo.paymentInfo;
      this._globalScope.isoCurrency = response.vendorInfo.isoCurrency;

      if(response.vendorInfo.mojoWebCSS!=undefined){
        this.applyTheme(response.vendorInfo.mojoWebCSS);
        this._globalScope.MOJOWEBCSS=response.vendorInfo.mojoWebCSS;
      }   

      if(response.vendorInfo.pictureLogo!=undefined){
        this._globalScope.VENDOR_LOGO_URL = response.vendorInfo.pictureLogo.url;
      }

      if (response.vendorInfo.webIcon){
        this.applyAppleTouchIcon(response.vendorInfo.webIcon);
        this.applyGenericIcon(response.vendorInfo.webIcon);
      } else {
        //no webIcon is provided, try using the logo, if one exists
        if (this._globalScope.VENDOR_LOGO_URL){
          this.applyAppleTouchIcon(this._globalScope.VENDOR_LOGO_URL);
          this.applyGenericIcon(this._globalScope.VENDOR_LOGO_URL);
        }
      };

      this.setTitle(this._globalScope.VENDOR_NAME);

      this.loading = false;  
      if((this._globalScope.KIOSK && localStorage.getItem(SESSION_TOKEN_PREF_KEY) == null) && this._globalScope.SOURCE_ID){
        this.router.navigate(['/login'], { queryParams: { sourceId: this._globalScope.SOURCE_ID }, skipLocationChange:true });
      }
      else if (this._globalScope.KIOSK && localStorage.getItem(SESSION_TOKEN_PREF_KEY) == null) {
        this.router.navigate(['/login'], {skipLocationChange:true});
      } 
       else if((response.truckList.length==1 && !response.truckList[0].bulkMenuHeader) && (this._globalScope.VIEW_MENU && this._globalScope.SOURCE_ID)){
        let menuId: string = response.truckList[0].menuHeader.objectId;
        let locationId: string = response.truckList[0].objectId;
        this.router.navigate(['/menu', {menuId: menuId, locationId: locationId, mode: 1}], { queryParams: { sourceId: this._globalScope.SOURCE_ID }, skipLocationChange:true});
      } 
      else if((response.truckList.length==1 && !response.truckList[0].bulkMenuHeader) && this._globalScope.VIEW_MENU){
        let menuId: string = response.truckList[0].menuHeader.objectId;
        let locationId: string = response.truckList[0].objectId;
        this.router.navigate(['/menu', {menuId: menuId, locationId: locationId, mode: 1}], {skipLocationChange:true});
      } 
      else if(this._globalScope.SOURCE_ID){
        this.router.navigate(['/locationselection'], { queryParams: { sourceId: this._globalScope.SOURCE_ID }, skipLocationChange:true});
      }
      else {
        this.router.navigate(['/locationselection'], {skipLocationChange:true});
      }
   }, httpError =>{
    console.log(httpError);
    //probably should show an error message to the user
    var err = JSON.parse(httpError._body).error;
    if (err && err.message)
    this.loading = false;
    return;
   });
  }
  else{
    let options={backdrop:false, keyboard:false, windowClass: 'dark-modal'};
    this.modalService.open(this.offlinePopup, options);
  }
 }  
}

