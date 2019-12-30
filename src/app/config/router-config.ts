import {MenuComponent} from "../component/menu.component";
import {PaymentComponent} from "../component/payment.component";
import {OrderCreateComponent} from "../component/order-create.component";
import {LocationSelectionComponent} from "../component/location-selection.component";
import {EntryComponent} from "../component/entry.component";
import {KioskComponent} from "../component/kiosk.component";
import {LoginComponent} from "../component/login.component";
import {CategoryMenuComponent} from "../component/category-menu.component";

export const routerConfig = [
  {
    path: 'locationselection',
    component: LocationSelectionComponent
  },
  {
    path: 'menu',
    component: MenuComponent
  },
  {
    path: 'payment',
    component: PaymentComponent
  },
  {
    path: 'create',
    component: OrderCreateComponent
  },
  {
    path: 'kiosk',
    component: KioskComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'categorymenu',
    component: CategoryMenuComponent,
  },
  
  {
    path: '',
    component: EntryComponent
  },
  {
    path: '**',
    component: EntryComponent
  }
];
