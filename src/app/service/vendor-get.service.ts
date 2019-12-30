import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {Observable} from "rxjs/Observable";
import {GlobalScopeService} from "./global-scope.service";

@Injectable()
export class VendorGetService {

  constructor(private _httpService: HttpService, private _globalScope: GlobalScopeService) {
  }

  getVendor(): Observable<any> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("vendorGetInfo", {
        vendorId: this._globalScope.VENDOR_ID
      }).subscribe(response => {
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
