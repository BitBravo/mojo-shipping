import {Component, OnInit} from "@angular/core";
import {GlobalScopeService} from "../service/global-scope.service";
import {Router} from "@angular/router";
import {AddressService} from "../service/address.service";
import {
  HEARTLAND_KEY,
  KIOSK_URL_PARAM,
  SESSION_TOKEN_PREF_KEY,
  VENDOR_ID_LENGTH,
  VENDOR_URL_PARAM,
  VENDOR_MENU_PARAM,
  SOURCE_ID_PARAM
} from "../config/global-config";
import {VendorGetService} from "../service/vendor-get.service";
import { Title } from '@angular/platform-browser';

declare var google: any;

@Component({
  selector: 'app-entry',
  templateUrl: '../template/entry.component.html',
  styleUrls: ['../style/entry.component.css']
})
export class EntryComponent implements OnInit {

  public isError: boolean;
  public loading: boolean;
  public isOffline: boolean;
  
  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );

    //iOs meta tag
    var metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'apple-mobile-web-app-title');
    metaTag.setAttribute('content', newTitle);
    document.head.insertBefore(metaTag, document.head.firstChild);  
  }

  constructor(private router: Router, private _globalScope: GlobalScopeService, private _vendorGetService: VendorGetService, private titleService: Title,private _addressService: AddressService) {
    this.isError = false;
    this.loading = true;
    this.isOffline = false;
    console.log(titleService);
  }

  ngOnInit() {
    if (navigator.onLine) {
      // Has connection, go do something
      this.loadLocation();
    }
    else{
      this.isOffline = true;
      this.loading = false; 
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
      this.loadLocation();
    }
  }

  private loadLocation(){
    if (window.location.hostname.split('.')[0] == 'app') {
      this._globalScope.APPLICATION_ID = "mojoPRD";
    } else {
      this._globalScope.APPLICATION_ID = "mojoDev";
    }
    this._globalScope.BASE_URL = window.location.protocol + "//" + window.location.hostname;
    if (window.location.port != null || window.location.port !="") {
      this._globalScope.BASE_URL = this._globalScope.BASE_URL + ":" + window.location.port;
    }
    if (this._globalScope.BASE_URL.includes("localhost:4200")) {
        this._globalScope.BASE_URL = this._globalScope.BASE_URL.replace("localhost", "dev.getyomojo.com").replace("http", "https").replace(":4200", "");
      // this._globalScope.BASE_URL = this._globalScope.BASE_URL.replace("localhost", "ar-nodejs.ddns.net").replace("http", "https").replace(":4200", "1337");
      // this._globalScope.BASE_URL = this._globalScope.BASE_URL.replace(":4200", ":1337");

    }
    
    // if (this._globalScope.BASE_URL.includes("192.168.11.192:4200")) {
    //   this._globalScope.BASE_URL = this._globalScope.BASE_URL.replace("192.168.11.192", "dev.getyomojo.com").replace("http", "https").replace(":4200", "");
    // }
    
  let vendorId: string = this.router.routerState.snapshot.root.queryParams[VENDOR_URL_PARAM]; //need to set vendor query string parameter
  if (vendorId == null || vendorId.length < VENDOR_ID_LENGTH) {
    this.isError = true;
    this.loading = false;
    return;
  }
  this._globalScope.VENDOR_ID = vendorId;

  let sourceId: string = this.router.routerState.snapshot.root.queryParams[SOURCE_ID_PARAM];
  if(sourceId== null){
    this._globalScope.SOURCE_ID="";
  }
  else{
  this._globalScope.SOURCE_ID=sourceId;
  }

  let viewMenu: boolean = this.router.routerState.snapshot.root.queryParams[VENDOR_MENU_PARAM];
   if (viewMenu == null) {
    this._globalScope.VIEW_MENU=false;
   } else {
    this._globalScope.VIEW_MENU = viewMenu;
  }

  let kiosk: boolean = this.router.routerState.snapshot.root.queryParams[KIOSK_URL_PARAM]; //need to set kiosk query string parameter
  if (kiosk == null) {
    this._globalScope.KIOSK = false;
  } else {
    this._globalScope.KIOSK = kiosk;
  }

  this.loading=true;
  this._vendorGetService.getVendor().subscribe(response => {
    console.log(response);
    if (response == null || response.vendorInfo == null || response.vendorInfo.paymentInfo == null || response.vendorInfo.paymentInfo.length == 0) {
      this.isError = true;
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
  this.isError = true;
  this.loading = false;
  return;
  });
 }
}
