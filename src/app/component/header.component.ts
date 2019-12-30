import { Component, OnInit } from "@angular/core";
import { GlobalScopeService } from "../service/global-scope.service";
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: '../template/header.component.html',
  styleUrls: ['../style/header.component.css']
})
export class HeaderComponent implements OnInit {

  showBack: boolean;
  showPlaceOrder: boolean;
  showShoppingCart: boolean;
  route: any;

  constructor(public _globalScopeService: GlobalScopeService,
    private _location: Location,
    private router: Router
  ) {

  //  router.events
  //   .filter((e: any) => e instanceof NavigationEnd )
  //   .pairwise()
  //   .subscribe((e: any) => {
  //     this.route=e[0].url;
  //   });


  router.events.subscribe(event => {
    if (event instanceof NavigationEnd ) {
      if (this._globalScopeService.VENDOR_ID==undefined || event.url.startsWith("/locationselection") || event.url.startsWith("/create")) {  // event.url has current url
        this.showBack = false;
      } else {
        this.showBack = true;
      }
    }
  });

  router.events.subscribe(event => {
    if (event instanceof NavigationEnd ) {
      if (this._globalScopeService.VENDOR_ID==undefined || event.url.startsWith("/locationselection") || event.url.startsWith("/create") ||  event.url.startsWith("/payment")) {   // event.url has current url
        this.showShoppingCart=false;
      } else {
        this.showShoppingCart=true;
      }
    }
  });

  router.events.subscribe(event => {
    if (event instanceof NavigationEnd ) {
      if (event.url.startsWith("/locationselection") && this._globalScopeService.VIEW_MENU) {     // event.url has current url
        this.showPlaceOrder = false;
      } else if (this._globalScopeService.VIEW_MENU){
        this.showPlaceOrder = true;
        this.showShoppingCart = false;
      }
      else{
        this.showPlaceOrder = false;
      }
    }
  });
 }

  ngOnInit() {
    //subscribe to the cart state event here
    this._globalScopeService.onBackButtonToggleRequested.subscribe(() => {
      this.showBack = !this.showBack;
    });
  }

  toggleOrder = () =>{
    this._globalScopeService.toogleCartState();
  }

  goBack = () => {
    //this._location.back();
    //this.router.navigateByUrl(this.route, {skipLocationChange:true} );
    let currentUrl = this.router.url;
    let menu:any="/menu;menuId="+this._globalScopeService.MENU_ID+";locationId="+this._globalScopeService.PICKUP_LOCATION_ID+";mode="+this._globalScopeService.MODE+"";
    //let category:any="/categorymenu;id="+this._globalScopeService.CATEGORY_ID+"";

    if(currentUrl=="/payment"){
      this._globalScopeService.IS_MENU_CLASS_VISIBLE=true;
      //this.router.navigate(['/categorymenu', {id: this._globalScopeService.CATEGORY_ID}], {skipLocationChange:true} );
      this.router.navigate(['/menu', {menuId: this._globalScopeService.MENU_ID, locationId: this._globalScopeService.PICKUP_LOCATION_ID, mode: this._globalScopeService.MODE}], {skipLocationChange:true});
    }
    if(currentUrl=="/categorymenu"){
      this._globalScopeService.IS_MENU_CLASS_VISIBLE=true;
      this.router.navigate(['/menu', {menuId: this._globalScopeService.MENU_ID, locationId: this._globalScopeService.PICKUP_LOCATION_ID, mode: this._globalScopeService.MODE}], {skipLocationChange:true});
    }
    
    if(currentUrl==menu){
      this.router.navigate(['/locationselection'], {skipLocationChange:true});
    }
  }

  public orderMenu(){
    this._globalScopeService.VIEW_MENU=false;
    if(this._globalScopeService.SOURCE_ID){
     this.router.navigate(['/locationselection'], { queryParams: { sourceId: this._globalScopeService.SOURCE_ID }, skipLocationChange:true});
    }
    else{
    this.router.navigate(['/locationselection'],{skipLocationChange:true});
   }
 }


public grandTotalCalculate(): number{
  if(this._globalScopeService.globalOrder != null){
  if (!this._globalScopeService.globalOrder.deliveryCost)
    this._globalScopeService.globalOrder.deliveryCost = 0;
    
  if (!this._globalScopeService.globalOrder.deliveryTax)
    this._globalScopeService.globalOrder.deliveryTax = 0;

  }  
    if(this._globalScopeService.ORDER_AMOUNT==0){
      return this._globalScopeService.ORDER_AMOUNT;
    }
    else{
    return this._globalScopeService.ORDER_AMOUNT + this._globalScopeService.TAX_AMOUNT + this._globalScopeService.globalOrder.deliveryCost + this._globalScopeService.globalOrder.deliveryTax;
    }
}


}

