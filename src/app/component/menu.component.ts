import { Component, OnInit, ViewChild } from "@angular/core";
import { MenuGetService } from "../service/menu-get.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgbAccordion } from "@ng-bootstrap/ng-bootstrap";
import { Item } from "../model/Order/Item";
import { OrderTotalService } from "../service/order-total.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Category } from "../model/menu/Category";
import { MenuItem } from "../model/menu/MenuItem";
import { OptionGroup } from "../model/menu/OptionGroup";
import { Option } from "../model/menu/Option";
import { OrderOption } from "../model/Order/Option";
import { GlobalScopeService } from "../service/global-scope.service";
import { CustomSpinnerComponent } from "../miniComponent/custom-spinner/custom-spinner.component";
import NumberFormat = Intl.NumberFormat;
import { PriceQty } from "../model/menu/PriceQty";
import { Order } from "../model/Order/Order";
import {PerfectScrollbarComponent} from "angular2-perfect-scrollbar";

@Component({
  selector: 'app-menu',
  templateUrl: '../template/menu.component.html',
  styleUrls: ['../style/menu.component.css']
})

export class MenuComponent implements OnInit {

  public categoriesNew: Category[];
  private selectedMenuItem: MenuItem;
  private selectedOrderItem: Item;
  private selectedLocationId: string;
  private orderList: Item[];
  private activeIds: string;
  private orderCalcResponse: any;
  private errorMessage: string;
  private readOnly: boolean;
  public loading: boolean;
  private modalMessage: string;
  private formattedtipAmount:string;
  private minimumOrderAmount: number;

  private menuItemOptionGroups: any;
  activeTabId: string = null;
  private CurrentProperties =[]; 
  private order:Order;
  private orderTipCalcResponse: any;
  private categories: any;

  @ViewChild('noticePeriodPopup') noticePeriodPopup;
  @ViewChild('tipPopup') tipPopup;
  @ViewChild('orderAccordion') orderAccordion:NgbAccordion;

  constructor(private modalService: NgbModal,
    private _menuGetService: MenuGetService,
    private _orderTotalService: OrderTotalService,
    public _globalScopeService: GlobalScopeService,
    private route: ActivatedRoute,
    private router: Router,
    public scroll:PerfectScrollbarComponent) {
    this.orderList = [];
    this.orderCalcResponse = {};
    this.order=this._globalScopeService.globalOrder;

    //make sure that the cart is closed.
    if (this._globalScopeService.getCartState == true){
        this._globalScopeService.toogleCartState();
        this._globalScopeService.IS_SCROLL_HIDE=false;
    }  
  }

  ngOnInit() {
    this.scroll.scrollTo(0,0);
    this.route.params
      .subscribe(params => {
        this._globalScopeService.PICKUP_LOCATION_ID = params["locationId"];
        this._globalScopeService.MODE=params['mode'];

      if(this._globalScopeService.CATEGORY!=null && this._globalScopeService.CATEGORY!=""){
        
        this.categories=this._globalScopeService.CATEGORY.filter(function(e){ 
          return e.locationId== params["locationId"]});
        }
        if(this.categories== undefined || this.categories.length==0){
         this.loading = true;

        this._menuGetService.getMenu(params['menuId'], this._globalScopeService.PICKUP_LOCATION_ID).subscribe(response => {
          this.categoriesNew = this.formatCategory(response);
          this.menuItemOptionGroups = response.menuItemOptionGroups;
          this._globalScopeService.MENU_ITEM_OPTION_GROUPS=response.menuItemOptionGroups;
          this.minimumOrderAmount = response.minOrderAmt;
                

          let data={ locationId : params["locationId"], menuCategory : this.categoriesNew };
          
          if(this._globalScopeService.CATEGORY==null || this._globalScopeService.CATEGORY=="")
          this._globalScopeService.CATEGORY=[];
          this._globalScopeService.CATEGORY.push(data);


          this.loading = false;
          this.checkForNotice(response);
        });

      }
      else{
        this.categoriesNew=this.categories[0].menuCategory;
        this.loading = false;
      }

        this.selectedLocationId = params['locationId'];
        this.readOnly = params['mode'] == 1 ? true : false;
      });
    //this.loading = true;

    //clear any previous totals
    this._globalScopeService.ORDER_AMOUNT = 0;
    
    if (this._globalScopeService.order !== undefined && this._globalScopeService.order.length !=0) {
      this.orderList = this._globalScopeService.order;
      // if(this.order!=undefined && this.order.isPickedOrDelivery==false){
      //   this._orderTotalService.getDeliveryTotal(this.orderList, this.selectedLocationId, this.order.deliveryCost, this.order.deliveryTax).subscribe(response => {
      //     this.orderCalcResponse = response;
      //     //this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.grandTotal);
          this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.amount);
      //   });
      // }
      // else{
      this._orderTotalService.getTotal(this.orderList, this.selectedLocationId).subscribe(response => {
        this.orderCalcResponse = response;
        //this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.grandTotal);
        this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.amount);
        this._globalScopeService.TAX_AMOUNT = parseFloat(this.orderCalcResponse.taxAmount);
      });
    //}
    }

    //subscribe to the cart state event here
    this._globalScopeService.onOrderViewToggleRequested.subscribe((state) => {
        //when the user is viewing the cart, hide the back button
        this._globalScopeService.toggleBackButton();
    });
  }

  private onOrderPanelChange($event){
    // console.log('Panel CHange!');
    //we use this event ot prevent the panel acutally toggling. In this
    //case we always want it to show and we will just show/hide the container as needed.
    this._globalScopeService.toogleCartState();
    $event.preventDefault();
  }

  private checkForNotice(response: any) {
    if (response.minOrderNotice != null && response.minOrderNotice > 0) {
      let hour: number = response.minOrderNotice;
      let minute: number = (response.minOrderNotice - Math.floor(response.minOrderNotice)) * 60;
      let date: Date = new Date();
      date.setUTCHours(date.getUTCHours() + hour);
      date.setUTCMinutes(date.getUTCMinutes() + minute);
      if (this._globalScopeService.PICKUP_TIME.getTime() < date.getTime()) {
        this.modalMessage = "Your requested pick up/delivery time is in less than the required notice period of " + hour.toString() + " hours ";
        if (minute > 0) {
          this.modalMessage = this.modalMessage + minute + "minutes";
        }
        this.modalMessage = this.modalMessage + ". We will do our best to accommodate you and one of our staff may contact you to confirm the order.";
        this.modalService.open(this.noticePeriodPopup);
      }
    };
  }

  private formatCategory(response: any): Category[] {
    let categoriesTemp: Category[] = response.categories as Category[];
    let categories: Category[] = [];
    for (let category of categoriesTemp) {
      // if (category.menuItems != null && category.menuItems.length > 0) {
        categories.push(category);
      // }
    }
    categories.sort((a, b) => {
      return a.displayOrder > b.displayOrder ? 1 : -1;
    });
    for (let category of categories) {
      if (category.menuItems){
        category.menuItems.sort((a, b) => {
          return a.displayOrder > b.displayOrder ? 1 : -1;
        });

        var candidateMenuItems : MenuItem[] = [];

        for (let menuItem of category.menuItems) {
          //if there is no price assigned to this menu item then do not show it.
          if (!menuItem.prices || menuItem.prices.length == 0)
            continue;

          if (menuItem.menuItemImage && menuItem.menuItemImage.url)
            menuItem.picture = menuItem.menuItemImage.url;

          if (menuItem.optionGroups == null)
            continue;
          for (let group of menuItem.optionGroups) {
            let tempOptionGroup: any = this.getOptionGroup(group.objectId, response.menuItemOptionGroups);
            if (tempOptionGroup != null) {
              group.name = tempOptionGroup.name;
              group.enableMultiplier = tempOptionGroup.enableMultiplier;
              group.options = [];
              for (let option of tempOptionGroup.options) {
                let tempOption: Option = new Option();
                tempOption.description = option.description;
                tempOption.id = option.id;
                tempOption.price = option.price;
                tempOption.qtyEnabled = option.qtyEnabled;
                tempOption.properties = option.properties;
                group.options.push(tempOption);
              }
            }
            if (group.options == null)
              group.options = [];
            for (let option of group.options) {
              option.default = group.defaultValues.indexOf(option.id) > -1 ? true : false;
            }
          }
          candidateMenuItems.push(menuItem);
        }
        category.menuItems = candidateMenuItems;
      }
    }
    return categories;
  }

  onCategoryPanelClick(panelClickEvent){
    //using the ID, get the category object
    this.categoriesNew.forEach(aCategory => {
      if (aCategory.objectId == panelClickEvent.panelId){
        //this.loadMenuItemsForCategory(aCategory);
        //this._globalScopeService.CATEGORY_NAME=aCategory.name;
        //this._globalScopeService.CATEGORY_ID=aCategory.objectId;
         this._globalScopeService.CATEGORY_ID=aCategory;
         this.router.navigate(['/categorymenu'], {skipLocationChange:true}); 
      }
    });
  };

  // private loadMenuItemsForCategory(category:Category){
  //   var self = this;
  //   // console.log('Category Clicked!');
  //   if (category && (!category.menuItems || category.menuItems.length == 0)){
  //     this.loading = true;
  //     this._menuGetService.getMenuItemsForCategory(category.objectId)
  //     .subscribe(response => {
  //       //we have to call the 'process method' as this will format the data
  //       //in a way that is 'friendly' to the app
  //       category.menuItems = response;
  //       var categoryArray = this.formatCategory({categories:[category], menuItemOptionGroups:self.menuItemOptionGroups });
  //       this.loading = false;
  //     }, error => {
  //       console.log(error);
  //       this.errorMessage = 'Well this is embarrassing! Something has gone wrong. Please try again later.'
  //       this.loading = false;
  //     });
  //   };
  // }

  private getOptionGroup(id: string, optionGroups: any[]) {
    for (let group of optionGroups) {
      if (group.objectId == id)
        return group;
    }
  }

  // private isIncluded(group: OptionGroup, option: Option): boolean {
  //   for (let tempOption of this.selectedOrderItem.options) {
  //     if (tempOption.id == group.objectId + "-" + option.id) {
  //       if (option.default) {
  //         return !tempOption.removed;
  //       }
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  private isOptionDefault(aOption: OrderOption, aSelectedMenuItem: MenuItem){
    let aIsDeafult = false;

    let matchingOptionGroup = this.getOptionGroup(aOption.optionGroupId, aSelectedMenuItem.optionGroups);
    if (matchingOptionGroup){
      console.log(matchingOptionGroup);
      //loop through the option group and find the option
      for (let tempOption of matchingOptionGroup.options) {
        if (tempOption.id == aOption.optionUniqueIdentifier){
          aIsDeafult = tempOption.default;
          break;
        }
      };
    };

    return aIsDeafult;
  }

  // open(menuItem: MenuItem, content: any) {
  //   this.activeTabId = null;
  //   this.selectedMenuItem = menuItem;
  //   this.selectedOrderItem = new Item();
  //   this.selectedOrderItem.id = menuItem.objectId;
  //   this.selectedOrderItem.menuItem = menuItem;
  //   this.selectedOrderItem.name = menuItem.name;
  //   if (this.selectedMenuItem.prices && this.selectedMenuItem.prices.length > 0)
  //     this.selectedOrderItem.priceText = this.selectedMenuItem.prices[0].text;
  //   this.selectedOrderItem.options = [];
  //   this.selectedOrderItem.minTotalOrderAmount = menuItem.minTotalOrderAmount;
  //   this.ApplyDefaultOptions();

  //   this.globalScopeService.activeModal = this.modalService.open(content);

  //   this.globalScopeService.activeModal.result.then((result) => {
  //     //this gets called when the user closes the modal dialog box (only when they click OK)
  //     this.loading = true;

  //     this.orderList.push(this.selectedOrderItem);
  //     // if(this.order!=undefined && this.order.isPickedOrDelivery==false){
  //     //   this._orderTotalService.getDeliveryTotal(this.orderList, this.selectedLocationId, this.order.deliveryCost, this.order.deliveryTax).subscribe(response => {
  //     //     this.orderCalcResponse = response;
  //     //     this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.grandTotal);
  //     //     this.loading = false;
  //     //   });
  //     // }
  //     // else{
  //     this._orderTotalService.getTotal(this.orderList, this.selectedLocationId).subscribe(response => {
  //       this.orderCalcResponse = response;
  //       //this._globalScopeService.ORDER_AMOUNT  = parseFloat(this.orderCalcResponse.grandTotal);
  //       this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.amount);  
  //       this.loading = false;
  //     });
  //     // }
  //     this.selectedMenuItem = null;
  //     this.selectedOrderItem = null;
  //     this.errorMessage = null;
  //   }, (reason) => {
  //     this.selectedMenuItem = null;
  //     this.selectedOrderItem = null;
  //     this.errorMessage = null;
  //   });
  //   this.validateOrder();
  // }

  // private validateOrder() {
  //   this.errorMessage = null;
  //   if (this.selectedMenuItem.optionGroups == undefined)
  //     return;
  //   for (let group of this.selectedMenuItem.optionGroups) {
  //     let selected: number = 0;
  //     for (let option of this.selectedOrderItem.options) {
  //       if (option.id.includes(group.objectId) && option.removed == false) {
  //         selected = selected + 1;
  //       }
  //     }
  //     if (this.errorMessage == null) {
  //       this.errorMessage = '';
  //     }
  //     if (!this.OptionGroupNotAppliesToPricing(group)) {
  //       if (selected > group.maxAmount && group.maxAmount > 0) {
  //         this.errorMessage = "You may only select " + group.maxAmount + " option(s) from " + group.name;
  //         return;
  //       }
  //       if (selected < group.amount) {
  //         this.errorMessage = "Please select at least " + group.amount + " option(s) from " + group.name;
  //       }
  //     }
  //     this.ValidateQuantityBasedOn_priceQty(group);
  //   }
  // }

  // private changeQuantity(increase: boolean) {
  //   if (increase) {
  //     this.selectedOrderItem.qty++;
  //   } else {
  //     let tempQty: number = this.selectedOrderItem.qty - 1;
  //     tempQty = tempQty <= 0 ? 1 : tempQty;
  //     this.selectedOrderItem.qty = tempQty;
  //   }
  // }

  private deleteItem(item: any) {
    for (let order of this.orderList) {
      if (order.id != item.id || order.qty != item.qty || order.priceText != item.priceText || order.options.length != item.options.length)
        continue;
      for (let itemOption of item.options) {
        if (order.options.indexOf(itemOption) == -1) {

        }
      }
      this.orderList.splice(this.orderList.indexOf(order), 1);
      this._globalScopeService.order = this.orderList;
    }
    this.loading = true;
    // if(this.order!=undefined && this.order.isPickedOrDelivery==false){
    //   this._orderTotalService.getDeliveryTotal(this.orderList, this.selectedLocationId, this.order.deliveryCost, this.order.deliveryTax).subscribe(response => {
    //     this.orderCalcResponse = response;
    //     this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.grandTotal);
    //     this.loading = false;
    //   });
    // }
    // else{
      //if this was the last item in the order, no point in calling getTotal
      //just set everything to zero
    if (this.orderList && this.orderList.length > 0)
      this._orderTotalService.getTotal(this.orderList, this.selectedLocationId).subscribe(response => {
        this.orderCalcResponse = response;
        if (this.orderCalcResponse.grandTotal > 0)
          //this._globalScopeService.ORDER_AMOUNT  = parseFloat(this.orderCalcResponse.grandTotal);
          //this._globalScopeService.ORDER_AMOUNT = parseFloat(this.grandTotalCalculate);
          this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.amount); 
        else
        this._globalScopeService.ORDER_AMOUNT = 0;
          this.loading = false;
      });
    else {
        this._globalScopeService.ORDER_AMOUNT = 0;
        this.orderCalcResponse = {};
        this.loading = false;
    }
  // }
  }

  // private changesTest(aChange) {
  //   console.log(aChange);
  // }

  // get getSetOptionQty() {
  //   console.log(this);
  //   return 6;
  // }

  // set getSetOptionQty(aQty) {
  //   console.log(aQty);
  // };

  // private onOptionChange(selected: boolean, option: Option, group: OptionGroup, itemQuantity: string) {

  //   let itemQty: number = parseInt(itemQuantity);

  //   let searchId: string = group.objectId + "-" + option.id;
  //   if (selected) {
  //     this.itemQtyReset(option, group);

  //     if (itemQuantity == null) {
  //       itemQty = this.GetRemainingQtyOfOptionGroup(group);
  //     }
  //     let tempOption: OrderOption = new OrderOption();
  //     tempOption.id = searchId;
  //     tempOption.name = option.description;
  //     tempOption.price=option.price;
  //     // if(option.properties != undefined && option.properties.length>0){
  //     // tempOption.optionProperties=this.CurrentProperties;
  //     // this.CurrentProperties=[];
  //     // tempOption.optionGroupId = group.objectId;
      
  //     if(option.properties && option.properties.length>0){
  //       tempOption.optionProperties=this.CurrentProperties;
  //       this.CurrentProperties=[];
  //     }
      
  //     if (option.qtyEnabled && !option.default) {
  //       tempOption.qty = itemQty;
  //     }
  //     if (option.default) {
  //       for (let defaultOption of this.selectedOrderItem.options) {
  //         if (defaultOption.id == searchId) {
  //           defaultOption.qty = itemQty;
  //           defaultOption.removed = false;
  //           break;
  //         }
  //       }
  //     }
  //     else {
  //       this.selectedOrderItem.options.push(tempOption);
  //     }
  //     if ((group.amount == 1 || group.amount == 0) && group.maxAmount == 1) {
  //       for (let unselectOption of this.selectedOrderItem.options) {
  //         if (unselectOption.id.includes(group.objectId) && unselectOption.id != searchId) {
  //           let isDefault: boolean = false;
  //           for (let checkDefaultOption of group.options) {
  //             if ((group.objectId + "-" + checkDefaultOption.id) == unselectOption.id) {
  //               isDefault = checkDefaultOption.default;
  //             }
  //           }
  //           if (isDefault) {
  //             unselectOption.removed = true;
  //           } else {
  //             let index: number = this.selectedOrderItem.options.indexOf(unselectOption, 0);
  //             this.selectedOrderItem.options.splice(index, 1);
  //           }
  //         }
  //       }
  //     }
  //   }
  //   else {
  //     this.itemQtyReset(option, group);
  //   }
  //   this.validateOrder();
  // }

  // private itemQtyReset(option: Option, group: OptionGroup) {
  //   this.CurrentProperties=[];
  //   let searchId: string = group.objectId + "-" + option.id;
  //   for (let orderOption of this.selectedOrderItem.options) {
  //     if (orderOption.id == searchId) {
  //       if (option.default) {
  //         orderOption.removed = true;
  //       } else {
  //         let index: number = this.selectedOrderItem.options.indexOf(orderOption, 0);
  //         this.CurrentProperties=this.selectedOrderItem.options[index].optionProperties;
  //         this.selectedOrderItem.options.splice(index, 1);
  //       }
  //     }
  //   }
  // }

  private checkout() {

    //the selected order item now has all the options that the user has selected including the
    //default ones. We do not send default options to the back end unless they have been modified
    //in some way (ie. removed or qty > 1)
    //so we need to loop through and remove any un-modified default options
    let index: number = 0;
      
    for (let aOrderItem of this.orderList){
      for (let tempOption of aOrderItem.options) {
        // console.log(tempOption);
        if  ((tempOption.optionProperties && tempOption.optionProperties.length == 0) &&
            (tempOption.removed == false) &&
            (tempOption.qty == 1)){
              
              if (this.isOptionDefault(tempOption, aOrderItem.menuItem) == true){
                //by marking an option as transparent, we tell the server that this is a 
                //default option which should not be saved in the back end.
                tempOption.transparent = true;
              };

        } else {
          tempOption.transparent = false;
        };
        index++;
      };
    };
    
    // let minimumAmount = this.minimumOrderAmount;
    // let menuName = "";
    // for (let item of this.orderList) {
    //   if (item.minTotalOrderAmount > minimumAmount) {
    //     minimumAmount = item.minTotalOrderAmount;
    //     menuName = item.name;
    //   }
    // }
    // if (minimumAmount > 0 && this.orderCalcResponse.grandTotal < minimumAmount) {
    //   if (menuName == null || menuName.length == 0) {
    //     this.modalMessage = "Minimum amount for order is $" + minimumAmount + ".";
    //   } else {
    //     this.modalMessage = menuName + " has minimum order amount of $" + minimumAmount + ". Please adjust your order quantity and continue.";
    //   }
    //   this.modalService.open(this.noticePeriodPopup);
    //   return;
    // }
    this._globalScopeService.order = this.orderList;

    if(this.order!=undefined && this.order.isPickedOrDelivery==false){
      this._orderTotalService.getDeliveryTipTotal(this.orderList, this.selectedLocationId, this.order.deliveryCost, this.order.deliveryTax, this.order.tipAmount).subscribe(response => {
        this.orderTipCalcResponse = response;
        this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderTipCalcResponse.amount);
        this._globalScopeService.TAX_AMOUNT = parseFloat(this.orderTipCalcResponse.taxAmount);
        this.loading = false;
      });
    }
      else{
        this._orderTotalService.getTipTotal(this.orderList, this.selectedLocationId, this.order.tipAmount).subscribe(response => {
        this.orderTipCalcResponse = response;
        this._globalScopeService.ORDER_AMOUNT  = parseFloat(this.orderTipCalcResponse.amount);
        this._globalScopeService.TAX_AMOUNT = parseFloat(this.orderTipCalcResponse.taxAmount);
        this.loading = false;
    });
    }

    if (this._globalScopeService.KIOSK && this._globalScopeService.SOURCE_ID) {
      this.router.navigate(['/kiosk'], { queryParams: { sourceId: this._globalScopeService.SOURCE_ID }, skipLocationChange:true});
    } 
    else if(this._globalScopeService.KIOSK)
      {
        this.router.navigate(['/kiosk'],{skipLocationChange:true});
      }
    else if(this._globalScopeService.SOURCE_ID){
      this.router.navigate(['/payment'], { queryParams: { sourceId: this._globalScopeService.SOURCE_ID }, skipLocationChange:true });
    }  
    else {
      this.router.navigate(['/payment'],{skipLocationChange:true});
    }
  }

  get taxTotalCalculate(){

    if (!this.order.deliveryTax)
      this.order.deliveryTax = 0;

    return this.orderCalcResponse.taxAmount + this.order.deliveryTax;
    
  }

  get grandTotalCalculate(){
    if (!this.order.deliveryCost)
      this.order.deliveryCost = 0;

      if (!this.order.deliveryTax)
      this.order.deliveryTax = 0;

      return parseFloat(this.orderCalcResponse.subTotal) + parseFloat(this.orderCalcResponse.taxAmount) + this.order.deliveryCost + this.order.deliveryTax;
  }

  // // Option Group to check with price text
  // get ListOfOptionGroupAppliesToPricing(){
  //  return this.selectedMenuItem.optionGroups.filter((optionGroup)=>{
  //    return !this.OptionGroupNotAppliesToPricing(optionGroup);
  //  });
  // }


  // /**
  //  * Check if optionGroup not applies to pricing
  //  * @param optionGroup option group to check
  //  */
  // OptionGroupNotAppliesToPricing(optionGroup: OptionGroup): boolean {
  //   return typeof optionGroup.appliesToPrices !== 'undefined' // check if appliesToPrices property exists
  //     && optionGroup.appliesToPrices.length > 0  //check if appliesToPrices array is not empty
  //     && optionGroup.appliesToPrices.indexOf(this.selectedOrderItem.priceText) === -1; //check if selected order price text contains in appliesToPrices 
  // }


  // /**
  //  * returns first Option group which applies to pricing
  //  */
  // FirstOptionGroupAppliesToPricing(): string {
  //   let preSelectedOptionGroup: OptionGroup = this.selectedMenuItem.optionGroups.find((optionGroup) => {
  //     return !this.OptionGroupNotAppliesToPricing(optionGroup);
  //   })
  //   return preSelectedOptionGroup.objectId;
  // }

  // /**
  //  * Apply default options for order-group 
  //  */
  // ApplyDefaultOptions() {
  //   this.selectedOrderItem.options = [];
  //   if (this.selectedMenuItem.optionGroups != null) {
  //     for (let optionGroup of this.selectedMenuItem.optionGroups) {
  //       if (optionGroup.options != null && !this.OptionGroupNotAppliesToPricing(optionGroup)) {
  //         for (let option of optionGroup.options) {
  //           if (option.default) {
  //             let tempOption: OrderOption = new OrderOption();
  //             tempOption.id = optionGroup.objectId + "-" + option.id;
  //             tempOption.name = option.description;
  //             tempOption.price=option.price;
  //             tempOption.isDefault=true;
  //             if (option.properties != undefined) {
  //               for (let property of option.properties) {
  //                 if (property.isDefault) {
  //                   tempOption.optionProperties.push(property);
  //                 }
  //               }
  //               this.selectedOrderItem.options.push(tempOption);
  //             }
  //              else
  //               {
  //               this.selectedOrderItem.options.push(tempOption);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   this.validateOrder();
  //   this.activeTabId = null;
  // }


  // /**
  //  * returns the total quantity of options for  an option group present in selectedOrderItem
  //  * @param group currently selected group 
  //  */
  // private GetTotalQuantityofGroupOption(group: OptionGroup): number {
  //   // filter those options of an option group
  //   let orderOptionsOfSelectedGroup: OrderOption[] = this.selectedOrderItem.options.filter((option) => option.optionGroupId === group.objectId);
  //   // check options are present in an option group
  //   if (orderOptionsOfSelectedGroup.length === 0) {
  //     return 0;
  //   }
  //   // get the Total Quantity from the array of options (orderOptionsOfSelectedGroup)
  //   let totalNumberOrderGroup: number = orderOptionsOfSelectedGroup.reduce((previous, current) => {
  //     return previous + current.qty;
  //   }, 0);
  //   return totalNumberOrderGroup;
  // }


  // /**
  //  * returns the remaining quantity 
  //  * @param group currently selected group 
  //  */
  // private GetRemainingQtyOfOptionGroup(group: OptionGroup): number {
  //   //  get the Total Quantity from the array of option
  //   let totalNumberOrderGroup: number = this.GetTotalQuantityofGroupOption(group);
  //   // Maximum Quantity for an Option Group on the basis of Price Text & Quantity
  //   let maxQuantity: number = this.GetMaxQtyForOptionGroup(group);
  //   let itemQty: number = 0;
  //   if (maxQuantity != null) {
  //     itemQty = maxQuantity - totalNumberOrderGroup;
  //   }

  //   //  if itemQty is less than zero then return 1 else return original value of itemQty
  //   itemQty = itemQty <= 0 ? 1 : itemQty;
  //   // returns remaining quantity
  //   return itemQty;
  // }


  // /**
  //  * returns the Maximum Quantity for a Option Group on the basis of Price Text & Quantity if priceQtys is defined else return null
  //  * @param group currently selected group 
  //  */
  // private GetMaxQtyForOptionGroup(group: OptionGroup) {
  //   let priceQtys: PriceQty[] = group.priceQty;
  //   if (priceQtys != undefined) {
  //     // Maximum Quantity for a Option Group on the basis of Price Text & Quantity
  //     let maxQuantity: number = priceQtys.find((pricQty) => {
  //       return this.selectedOrderItem.priceText === pricQty.text;
  //     }).qty;

  //     return maxQuantity;
  //   }
  //   return null;
  // }


//   /**
//  * It Gets the value from order items
//  * @param group currently selected group 
//  * @param selectedOption currently selected group option
//  * @param minimunQty Here we pass the minimum value of quantity
//  */
//   private GetQuantityFromOrderItems(group: OptionGroup, selectedOption: Option, minimumQty: number) {
//     let OptionInOrderItem: OrderOption = this.selectedOrderItem.options.find((option) => {
//       return option.id === group.objectId + "-" + selectedOption.id;
//     });

//     if (OptionInOrderItem && OptionInOrderItem.qty) {

//       let quantityOptionInOrderItem: number = OptionInOrderItem.qty;
//       if (quantityOptionInOrderItem !== 0) {
//         return quantityOptionInOrderItem.toString();
//       }
//       else
//         return minimumQty;

//     } else
//       return minimumQty;
//   }


//   /**
//  * Validate the quantity of an option-group based on the priceQty array in api's 
//  * @param group currently selected group 
//  */
//   private ValidateQuantityBasedOn_priceQty(group: OptionGroup) {
//     let maxQuantity: number = this.GetMaxQtyForOptionGroup(group);
//     if (maxQuantity != null) {
//       let totalNumberOrderGroup: number = this.GetTotalQuantityofGroupOption(group);
//       if (totalNumberOrderGroup > maxQuantity && maxQuantity > 0) {
//         this.errorMessage = `You have selected ${totalNumberOrderGroup}. Maximum is ${maxQuantity}`;
//         return;
//       }
//     }
//   }

//   // Handles tab changing id
//   handleTabChange(event, taby: any) {
//     taby.activeId = event.nextId;
//     this.activeTabId = taby.activeId;
//   }


  // // Get the active tab
  // GetActiveTabId() {
  //   if (this.activeTabId == null) {
  //     return 'tab-' + this.FirstOptionGroupAppliesToPricing();
  //   }
  //   return this.activeTabId;
  // }


  // private onOptionChangeProperty(selected: boolean, option: Option, group: OptionGroup, property: any) {
  //   let searchId: string = group.objectId + "-" + option.id;

  //   let tempOption: OrderOption = this.selectedOrderItem.options.find((opt) => {
  //     return opt.id === group.objectId + "-" + option.id;
  //   });

  //     if (selected) {
  //       if (tempOption.id == searchId) {
  //         if (option.properties != undefined) {
  //           tempOption.optionProperties.push(property);
  //         }
  //       }
  //     }
  //     else {
  //       let index: number = tempOption.optionProperties.indexOf(property, 0);
  //       tempOption.optionProperties.splice(index, 1);
  //     }
  // }

  
  // private isPropertyIncluded(group: OptionGroup, option: Option, property: any): boolean {

  //     let tempOption: OrderOption = this.selectedOrderItem.options.find((opt) => {
  //     return opt.id === group.objectId + "-" + option.id;
  //     });
    
  //     if(tempOption!=undefined){
  //     let isPropertyChecked = tempOption.optionProperties.filter((opt)=>opt.id===property.id)
  //     if (tempOption.id == group.objectId + "-" + option.id) {
  //       if (option.properties != undefined) {
  //         if (property.isDefault) {
  //           return true;
  //         }
  //         else if(isPropertyChecked.length>0)
  //         {
  //             return true;
  //         }
  //       }
  //     }
  //   }
  //   return false;
  // }


  openTipPopup(){
    let minimumAmount = this.minimumOrderAmount;
    let menuItemName = "";
    // a menu item can have a minimum order amount
    //this is primarily used for catering menus
    //Look at the order calculation response from the server 
    //and compare against the minimum order amount required for the menu item
    // console.log(this.orderCalcResponse.items);
    for (let orderItem of this.orderCalcResponse.items){
      if (this.orderCalcResponse.subTotal < orderItem.minTotalOrderAmount){
        this.modalMessage = "Order with " + orderItem.name + " must be a minimum of $" + orderItem.minTotalOrderAmount + ". Please adjust your order.";
        this.modalService.open(this.noticePeriodPopup);
        return;
      }
    };

    // for (let item of this.orderList) {
    //   if (item.minTotalOrderAmount > minimumAmount) {
    //     minimumAmount = item.minTotalOrderAmount;
    //     menuItemName = item.name;
    //   }
    // }
    //if this is a delivery order then there could be a minimum for the menu and a minimum for delivery
    // in this case just choose the one that is greater
    if(this.order!=undefined && this.order.isPickedOrDelivery==false){ //apparently false means its a delivery (smh)
      //1. get the minimum for delivery (if there is one)
      var targetMinimun:number = 0;
      if (this._globalScopeService.selectedLocation.delivery.minimumOrder.enabled == true){
        targetMinimun = this._globalScopeService.selectedLocation.delivery.minimumOrder.amount;
      };
      //now see if there is a minimum for the menu
      if (this.minimumOrderAmount > targetMinimun){
        targetMinimun = this.minimumOrderAmount;
      };

      //finally check the order total against our target minimum amount
      if (targetMinimun > this.orderCalcResponse.subTotal){
        this.modalMessage = "Delivery order must be a minimum of $" + targetMinimun + ". Please adjust your order.";
        this.modalService.open(this.noticePeriodPopup);
        return;
      };

    } else {
      //for non delivery orderes just make sure that the menu minimum has been met.
      if (minimumAmount > 0 && this.orderCalcResponse.grandTotal < minimumAmount) {
        // if (menuItemName == null || menuItemName.length == 0) {
        //   this.modalMessage = "A minimum amount of $" + minimumAmount + " is required for item " + menuItemName + ".";
        // } else {
          this.modalMessage = "Pick up order must be a minimum of $" + minimumAmount + ". Please adjust your order.";
          this.modalService.open(this.noticePeriodPopup);
          return;
      }
    }



    // if(this.order!=undefined && this.order.isPickedOrDelivery==false){ //apparently false means its a delivery (smh)
    //   if (this._globalScopeService.selectedLocation.delivery.minimumOrder.enabled == true){
    //     if (this._globalScopeService.selectedLocation.delivery.minimumOrder.amount > this.orderCalcResponse.subTotal){
    //       this.modalMessage = menuName + "Delivery order must be for a minimum of $" + this._globalScopeService.selectedLocation.delivery.minimumOrder.amount + ". Please adjust your order and continue.";
    //       this.modalService.open(this.noticePeriodPopup);
    //       return;
    //   } 
    //   }
    // };


    if (this.order.tipAmount !=undefined){
      this.order.tipAmount=0;
    };

    //reset the tip amount to default value of zero
    this._globalScopeService.globalOrder.tipAmount = 0;
    this._globalScopeService.tipAmount = 0;
    //set the taxAmount
    this._globalScopeService.globalOrder.taxAmount = this.orderCalcResponse.taxAmount;
    
    this._globalScopeService.activeModal = this.modalService.open(this.tipPopup);
  }
  
  doCurrencyRound(aNumber){
		var decimals = 2;
		var t=Math.pow(10, decimals);   
		
		return parseFloat((Math.round((aNumber * t) + (decimals>0?1:0)*(Math.sign(aNumber) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals));

  }
  
  calculateTipAmount(percentage: number){
    //the tip should be calculated on the total fo the product
    var aTipAmount = this.orderCalcResponse.amount * (percentage /100);
    aTipAmount = this.doCurrencyRound(aTipAmount);
    return aTipAmount;
  }

  setTip(val:number){
   this.order.tipAmount = this.calculateTipAmount(val);
   this._globalScopeService.tipAmount = this.doCurrencyRound(this.order.tipAmount);
  //  this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.grandTotal) + this._globalScopeService.tipAmount; //tip is set after we call getTotal so we need to manually add it in
  }

  resetTipAmount(val:number){
    this.order.tipAmount=0.00;    
    this._globalScopeService.tipAmount = 0.00;
    this.formattedtipAmount = "";
    this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.amount);
  }

  countDecimals(value:number) {
    if(Math.floor(value) === value) return 0;
    return value.toString().split(".").length >1 ? value.toString().split(".")[1].length || 0 : 0; 
  }

  setCustomTip(aTipAmount:any){
    if(aTipAmount!=null){
    if (this.countDecimals(aTipAmount) > 2){
      this.formattedtipAmount = parseFloat(aTipAmount).toFixed(2);
    }
    
    this._globalScopeService.tipAmount  = this.order.tipAmount = aTipAmount;
    // this._globalScopeService.ORDER_AMOUNT = parseFloat(this.orderCalcResponse.grandTotal) + Number(this.order.tipAmount);
   }
  else{
    this._globalScopeService.tipAmount  = this.order.tipAmount = 0.00;
  }
  }

  finalizeCustomTipAmount(){
    // console.log('Finalizing Tip Amount' + this.order.tipAmount);
    // if (this.countDecimals(this.order.tipAmount) > 2){
    //   this.formattedtipAmount = this.order.tipAmount.toFixed(2);
    // }

    // console.log(Intl.NumberFormat([], {minimumFractionDigits:2, useGrouping:false}).format(this.order.tipAmount));
    this.formattedtipAmount = Intl.NumberFormat([], {minimumFractionDigits:2, maximumFractionDigits:2, useGrouping:false}).format(this.order.tipAmount);
    this.setCustomTip(Number(this.formattedtipAmount));
  }
    
}
