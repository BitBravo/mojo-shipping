import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpService} from "./http.service";

@Injectable()
export class DeliveryCostCalculateService {

  constructor(private _httpService: HttpService) {
  }

  getDeliveryCostAmount(data: any): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("deliveryCostCalculate", data).subscribe(response => {
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
