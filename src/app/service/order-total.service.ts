import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpService} from "./http.service";
import {Item} from "../model/Order/Item";

@Injectable()
export class OrderTotalService {

  constructor(private _httpService: HttpService) {
  }

  getTotal(itemList: Item[], locationId: any): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("menuOrderCalcTotals", {
        truckId: locationId,
          items: itemList
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }

  getDeliveryTotal(itemList: Item[], locationId: any, deliveryCost: number, deliveryTax: number): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("menuOrderCalcTotals", {
        truckId: locationId,
          items: itemList,
          deliveryCost:deliveryCost,
          deliveryTax:deliveryTax,
          deliveryRequested:true
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }

  getTipTotal(itemList: Item[], locationId: any, tipAmount: number): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("menuOrderCalcTotals", {
          truckId: locationId,
          items: itemList,
          tipAmount:tipAmount
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }

  getDeliveryTipTotal(itemList: Item[], locationId: any, deliveryCost: number, deliveryTax: number, tipAmount: number): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("menuOrderCalcTotals", {
        truckId: locationId,
          items: itemList,
          deliveryCost:deliveryCost,
          deliveryTax:deliveryTax,
          tipAmount:tipAmount
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }
}
