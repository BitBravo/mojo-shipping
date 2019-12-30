import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpService} from "./http.service";
import {GlobalScopeService} from "../service/global-scope.service";

@Injectable()
export class ManifestGetService {

  constructor(private _httpService: HttpService, private _globalScope: GlobalScopeService) {
  }

  GetManifest(): Observable<string> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("generateManifest", {
        truck: this._globalScope.PICKUP_LOCATION_ID,
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