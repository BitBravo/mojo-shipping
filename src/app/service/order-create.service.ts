import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpService} from "./http.service";
import {Order} from "../model/Order/Order";

@Injectable()
export class OrderCreateService {

  constructor(private _httpService: HttpService) {
  }

  createOrder(order: Order): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("menuOrderCreateAnon", order).subscribe(response => {
          observer.next(response);
          observer.complete();
        }, err =>{
          console.log(err);
          observer.error(err);
          observer.complete();
        });
      }
    );
  }
}
