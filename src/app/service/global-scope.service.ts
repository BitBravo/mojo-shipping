import { Injectable, EventEmitter, Output } from "@angular/core";
import { Item } from "../model/Order/Item";
import { Order } from "../model/Order/Order";
import {LocationDetail} from "../model/location/LocationDetail";
import {NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

@Injectable()
export class GlobalScopeService {

  constructor() {
    this.ORDER_AMOUNT = 0;
    this.tipAmount = 0;
    this.TAX_AMOUNT = 0;
  }

  public activeModal: NgbModalRef;

  public selectedLocation:LocationDetail;
  public userTimeout : number;

  private _globalOrder:Order;
  public get globalOrder() : Order {
    return this._globalOrder;
  }
  public set globalOrder(v : Order) {
    this._globalOrder = v;
  }
  
  private _payInfo : any;
  public get payInfo() : any {
    return this._payInfo;
  }

  public set payInfo(v : any) {
    this._payInfo = v;
  }
  
  private _LOCATIONS : any;
  public get LOCATIONS() : any {
    return this._LOCATIONS;
  }
  public set LOCATIONS(v : any) {
    this._LOCATIONS = v;
  }

  private _KIOSK : boolean;
  public get KIOSK() : boolean {
    return this._KIOSK;
  }
  public set KIOSK(v : boolean) {
    this._KIOSK = v;
  }

  private _VENDOR_ID: string;
  public get VENDOR_ID(): string {
    return this._VENDOR_ID;
  }
  public set VENDOR_ID(v: string) {
    this._VENDOR_ID = v;
  }

  private _VENDOR_NAME : string;
  public get VENDOR_NAME() : string {
    return this._VENDOR_NAME;
  }
  public set VENDOR_NAME(v : string) {
    this._VENDOR_NAME = v;
  }

  private _VENDOR_LOGO_URL : string;
  public get VENDOR_LOGO_URL() : string {
    return this._VENDOR_LOGO_URL;
  }
  public set VENDOR_LOGO_URL(v : string) {
    this._VENDOR_LOGO_URL = v;
  }
  
  private _APPLICATION_ID : string;
  public get APPLICATION_ID() : string {
    return this._APPLICATION_ID;
  }
  public set APPLICATION_ID(v : string) {
    this._APPLICATION_ID = v;
  }
  
  private _BASE_URL : string;
  public get BASE_URL() : string {
    return this._BASE_URL;
  }
  public set BASE_URL(v : string) {
    this._BASE_URL = v;
  }
  
  private _PICKUP_LOCATION_ID : string;
  public get PICKUP_LOCATION_ID() : string {
    return this._PICKUP_LOCATION_ID;
  }
  public set PICKUP_LOCATION_ID(v : string) {
    this._PICKUP_LOCATION_ID = v;
  }
  
  private _PICKUP_TIME : any;
  public get PICKUP_TIME() : any {
    return this._PICKUP_TIME;
  }
  public set PICKUP_TIME(v : any) {
    this._PICKUP_TIME = v;
  }
  
  private _PICKUP_ADDRESS : string;
  public get PICKUP_ADDRESS() : string {
    return this._PICKUP_ADDRESS;
  }
  public set PICKUP_ADDRESS(v : string) {
    this._PICKUP_ADDRESS = v;
  }
  
  private _PICKUP_LATITUDE : number;
  public get PICKUP_LATITUDE() : number {
    return this._PICKUP_LATITUDE;
  }
  public set PICKUP_LATITUDE(v : number) {
    this._PICKUP_LATITUDE = v;
  }
  
  private _PICKUP_LONGITUDE : number;
  public get PICKUP_LONGITUDE() : number {
    return this._PICKUP_LONGITUDE;
  }
  public set PICKUP_LONGITUDE(v : number) {
    this._PICKUP_LONGITUDE = v;
  }
  
   private _PICKUP_LOCATION_NAME : string;
   public get PICKUP_LOCATION_NAME() : string {
     return this._PICKUP_LOCATION_NAME;
   }
   public set PICKUP_LOCATION_NAME(v : string) {
     this._PICKUP_LOCATION_NAME = v;
   }

  //no point doing set/get for tipAmount since its not stored
  public tipAmount : any;

  public grandTotalCalculateWithTip(): number{
    // console.log('Tip Amount is ' + this.tipAmount);
    if (this.tipAmount)
      return this.getGrandTotal() + parseFloat(this.tipAmount);
    else 
      return this.getGrandTotal();
  }

  public getGrandTotal(): number{
    // console.log('Order Amount is ' + this.ORDER_AMOUNT);
    return this.ORDER_AMOUNT + this.globalOrder.deliveryCost + this.globalOrder.deliveryTax + this.globalOrder.taxAmount;
  }

  private _ORDER_AMOUNT : number;
  public get ORDER_AMOUNT() : number {
    return this._ORDER_AMOUNT;
  }
  public set ORDER_AMOUNT(v : number) {
    this._ORDER_AMOUNT = v;
  }
     
   private _order : Item[];
   public get order() : Item[] {
     return this._order;
   }
   public set order(v : Item[]) {
     this._order = v;
   }
  
  private _ORDER_POST_RESPONSE : any;
  public get ORDER_POST_RESPONSE() : any {
    return this._ORDER_POST_RESPONSE;
  }
  public set ORDER_POST_RESPONSE(v : any) {
    this._ORDER_POST_RESPONSE = v;
  }
  
  private _isoCurrency : string;

  public get isoCurrency() : string {
    return this._isoCurrency;
  }

  public set isoCurrency(v : string) {
    this._isoCurrency = v;
  }

  private _MENU_ID : string;
  public get MENU_ID() : string {
    return this._MENU_ID;
  }
  public set MENU_ID(v : string) {
    this._MENU_ID = v;
  }
  
  private _VIEW_MENU : boolean;
  public get VIEW_MENU() : boolean {
    return this._VIEW_MENU;
  }
  public set VIEW_MENU(v : boolean) {
    this._VIEW_MENU = v;
  }
    
  private _AGE_VERIFICATION : boolean;
  public get AGE_VERIFICATION() : boolean {
    return this._AGE_VERIFICATION;
  }
  public set AGE_VERIFICATION(v : boolean) {
    this._AGE_VERIFICATION = v;
  }


  private _MOJOWEBCSS : any;
  public get MOJOWEBCSS() : any {
    return this._MOJOWEBCSS;
  }
  public set MOJOWEBCSS(v : any) {
    this._MOJOWEBCSS = v;
  }

  private _SOURCE_ID: string;
  public get SOURCE_ID(): string {
    return this._SOURCE_ID;
  }
  public set SOURCE_ID(v: string) {
    this._SOURCE_ID = v;
  }

  @Output() onBackButtonToggleRequested: EventEmitter<boolean> = new EventEmitter();
  public toggleBackButton(){
    this.onBackButtonToggleRequested.emit();
  }
  
  private _CART_STATE: boolean=false;
  @Output() onOrderViewToggleRequested: EventEmitter<boolean> = new EventEmitter();
  
  public get getCartState(): boolean{
    return this._CART_STATE;
  }

  public toogleCartState(){
    this._CART_STATE = !this._CART_STATE;
    this.IS_SCROLL_HIDE = !this.IS_SCROLL_HIDE;
    this.onOrderViewToggleRequested.emit(this._CART_STATE);
  }


  private _DELIVERY_ADDRESS : any;
  public get DELIVERY_ADDRESS() : any {
    return this._DELIVERY_ADDRESS;
  }
  public set DELIVERY_ADDRESS(v : any) {
    this._DELIVERY_ADDRESS = v;
  }

  private _DELIVERY_DESCRIPTION : any;
  public get DELIVERY_DESCRIPTION() : any {
    return this._DELIVERY_DESCRIPTION;
  }
  public set DELIVERY_DESCRIPTION(v : any) {
    this._DELIVERY_DESCRIPTION = v;
  }

  private _DELIVERY_LATITUDE : number;
  public get DELIVERY_LATITUDE() : number {
    return this._DELIVERY_LATITUDE;
  }
  public set DELIVERY_LATITUDE(v : number) {
    this._DELIVERY_LATITUDE = v;
  }
  
  private _DELIVERY_LONGITUDE : number;
  public get DELIVERY_LONGITUDE() : number {
    return this._DELIVERY_LONGITUDE;
  }
  public set DELIVERY_LONGITUDE(v : number) {
    this._DELIVERY_LONGITUDE = v;
  }

  private _DELIVERY_PLACE_ID : string;
  public get DELIVERY_PLACE_ID() : string {
    return this._DELIVERY_PLACE_ID;
  }
  public set DELIVERY_PLACE_ID(v : string) {
    this._DELIVERY_PLACE_ID = v;
  }

  private _DELIVERY_ENABLED : boolean;
  public get DELIVERY_ENABLED() : boolean {
    return this._DELIVERY_ENABLED;
  }
  public set DELIVERY_ENABLED(v : boolean) {
    this._DELIVERY_ENABLED = v;
  }

  private _DELIVERY_GMS_POSTAL_CODE : number;
  public get DELIVERY_GMS_POSTAL_CODE() : number {
    return this._DELIVERY_GMS_POSTAL_CODE;
  }
  public set DELIVERY_GMS_POSTAL_CODE(v : number) {
    this._DELIVERY_GMS_POSTAL_CODE = v;
  }

  private _DELIVERY_GMS_ADMIN_AREA : string;
  public get DELIVERY_GMS_ADMIN_AREA() : string {
    return this._DELIVERY_GMS_ADMIN_AREA;
  }
  public set DELIVERY_GMS_ADMIN_AREA(v : string) {
    this._DELIVERY_GMS_ADMIN_AREA = v;
  }

  private _DELIVERY_GMS_LOCALITY : string;
  public get DELIVERY_GMS_LOCALITY() : string {
    return this._DELIVERY_GMS_LOCALITY;
  }
  public set DELIVERY_GMS_LOCALITY(v : string) {
    this._DELIVERY_GMS_LOCALITY = v;
  }

  public onOrderComplete(){
    if (this.userTimeout)
      window.clearTimeout(this.userTimeout);    
  }

  public onOrderCancel(closeAnyPopups: boolean){
    
    if (this.activeModal && closeAnyPopups === true){
      this.activeModal.close();  
    };

    this.activeModal = null;

    if (this.userTimeout)
      window.clearTimeout(this.userTimeout);
  }
  
  private _MODE : number;
  public get MODE() : number {
    return this._MODE;
  }
  public set MODE(v : number) {
    this._MODE = v;
  }

  private _CATEGORY_ID : any;
  public get CATEGORY_ID() : any {
    return this._CATEGORY_ID;
  }
  public set CATEGORY_ID(v : any) {
    this._CATEGORY_ID = v;
  }

  private _CATEGORY : any;
  public get CATEGORY() : any {
    return this._CATEGORY;
  }
  public set CATEGORY(v : any) {
    this._CATEGORY = v;
  }


  private _MENU_ITEM_OPTION_GROUPS : any;
  public get MENU_ITEM_OPTION_GROUPS() : any {
    return this._MENU_ITEM_OPTION_GROUPS;
  }
  public set MENU_ITEM_OPTION_GROUPS(v : any) {
    this._MENU_ITEM_OPTION_GROUPS = v;
  }

  private _ARRAY_OF_CATEGORIES_ITEM : any;
  public get ARRAY_OF_CATEGORIES_ITEM() : any {
    return this._ARRAY_OF_CATEGORIES_ITEM;
  }
  public set ARRAY_OF_CATEGORIES_ITEM(v : any) {
    this._ARRAY_OF_CATEGORIES_ITEM = v;
  }

  private _IS_MENU_CLASS_VISIBLE : boolean;
  public get IS_MENU_CLASS_VISIBLE() : boolean {
    return this._IS_MENU_CLASS_VISIBLE;
  }
  public set IS_MENU_CLASS_VISIBLE(v : boolean) {
    this._IS_MENU_CLASS_VISIBLE = v;
  }

  private _TAX_AMOUNT : number;
  public get TAX_AMOUNT() : number {
    return this._TAX_AMOUNT;
  }
  public set TAX_AMOUNT(v : number) {
    this._TAX_AMOUNT = v;
  }

  private _IS_SCROLL_HIDE : boolean;
  public get IS_SCROLL_HIDE() : boolean {
    return this._IS_SCROLL_HIDE;
  }
  public set IS_SCROLL_HIDE(v : boolean) {
    this._IS_SCROLL_HIDE = v;
  }

  private _DEVICE_ID: string;
  public get DEVICE_ID(): string {
    return this._DEVICE_ID;
  }
  public set DEVICE_ID(v: string) {
    this._DEVICE_ID = v;
  }

  private _MANIFEST: string;
  public get MANIFEST(): string {
    return this._MANIFEST;
  }
  public set MANIFEST(v: string) {
    this._MANIFEST = v;
  }

}
