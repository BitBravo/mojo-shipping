import {BrowserModule, Title} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./component/app.component";
import {AgmCoreModule, GoogleMapsAPIWrapper} from "angular2-google-maps/core";
import {NgbDateParserFormatter, NgbDatepickerConfig, NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {VendorGetService} from "./service/vendor-get.service";
import {MenuGetService} from "./service/menu-get.service";
import {AddressService} from "./service/address.service";
import {OrderTotalService} from "./service/order-total.service";
import {ScheduleService} from "./service/schedule.service";
import {OrderCreateService} from "./service/order-create.service";
import {HttpService} from "./service/http.service";
import {MapComponent} from "./component/map.component";
import {LocationSelectionComponent} from "./component/location-selection.component";
import {LocationSummaryComponent} from "./component/location-summary.component";
import {MenuComponent} from "./component/menu.component";
import {RouterModule} from "@angular/router";
import {PaymentComponent} from "./component/payment.component";
import {OrderCreateComponent} from "./component/order-create.component";
import {MAP_KEY} from "./config/map-config";
import {routerConfig} from "./config/router-config";
import {GlobalScopeService} from "./service/global-scope.service";
import { PayGatewayFactory } from "./service/payGateway.service";
import {FormsModule} from "@angular/forms";
import {EntryComponent} from "./component/entry.component";
import {MapBoundComponent} from "./component/map-bound.component";
import {HeaderComponent} from "./component/header.component";
import {DefaultOptionsFilter} from "./pipe/defaultOptionsPipe";
import {CardNumberPipe} from "./pipe/card-number-pipe";
import {PhoneNumberPipe} from "./pipe/phone-number-pipe";
import {LoadingComponent} from "./component/loading.component";
import {KioskSettingComponent} from "./component/kiosk-setting.component";
import {KioskComponent} from "./component/kiosk.component";
import {LoginComponent} from "./component/login.component";
import {LoginService} from "./service/login.service";
import {NgbDateFRParserFormatter} from "./util/DateParser";
import { SuccessOrderModalComponent } from './success-order-modal/success-order-modal.component';
import { CustomSpinnerComponent } from "./miniComponent/custom-spinner/custom-spinner.component";
import {GooglePlaceModule} from 'ng2-google-place-autocomplete';
import { DeliveryCostCalculateService } from "./service/delivery-cost-calculate.service";
import {NgPipesModule} from 'ngx-pipes';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { PerfectScrollbarModule, PerfectScrollbarConfigInterface } from 'angular2-perfect-scrollbar';
import { CategoryMenuComponent } from "./component/category-menu.component";
import { ManifestGetService } from "./service/manifest-get.service";

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig  {
  overrides = <any>{
      'swipe': {velocity: 0.4, threshold: 20} // override default settings
  }
}

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    LocationSummaryComponent,
    MapComponent,
    LocationSelectionComponent,
    MenuComponent,
    PaymentComponent,
    OrderCreateComponent,
    EntryComponent,
    MapBoundComponent,
    HeaderComponent,
    LoadingComponent,
    DefaultOptionsFilter,
    CardNumberPipe,
    PhoneNumberPipe,
    KioskSettingComponent,
    KioskComponent,
    LoginComponent,
    SuccessOrderModalComponent,
    CustomSpinnerComponent,
    CategoryMenuComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    NgbModule.forRoot(),
    //AgmCoreModule.forRoot(MAP_KEY),
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyD2CQq5R9Ezo9Z0Icd68LApA-J5kTEgPm4",
      libraries: ['places']
    }),
    RouterModule.forRoot(routerConfig),
    GooglePlaceModule,
    NgPipesModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    // ServiceWorkerModule.register('/mojoweb/ngsw-worker.js', {
    //   enabled: environment.production
    // })
  ],
  providers: [HttpModule, HttpService, ScheduleService, AddressService, DeliveryCostCalculateService,
              MenuGetService, VendorGetService, OrderCreateService, OrderTotalService,  
              LoginService, NgbModal, NgbDatepickerConfig, GoogleMapsAPIWrapper, Title, 
              GlobalScopeService, PayGatewayFactory, ManifestGetService,
              {
                provide: NgbDateParserFormatter,
                useClass: NgbDateFRParserFormatter,
              },
              { 
                provide: HAMMER_GESTURE_CONFIG, 
                useClass: MyHammerConfig 
              }
], 
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule {

}
