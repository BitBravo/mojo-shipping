import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions} from "@angular/http";
import {GlobalScopeService} from "./global-scope.service";
import {SESSION_TOKEN_PREF_KEY} from "../config/global-config";

@Injectable()
export class HttpService {

  constructor(private _http: Http, private _globalScope: GlobalScopeService) {
  }

  getDataWithRequest(serviceName: string, requestData: any): Observable<any> {
    requestData.clientType = 'WEBAPP';
    let headerList = {
      'X-Parse-Application-Id': this._globalScope.APPLICATION_ID
    };
    if (this._globalScope.KIOSK && localStorage.getItem(SESSION_TOKEN_PREF_KEY) != null)
      headerList['X-Parse-Session-Token'] = localStorage.getItem(SESSION_TOKEN_PREF_KEY);
    let headers = new Headers(headerList);
    let options = new RequestOptions({headers: headers});
    return Observable.create(observer => {
        this._http
          .post(this._globalScope.BASE_URL + "/parse/functions/" + serviceName, requestData, options).subscribe(response => {
          observer.next(response.json().result);
          observer.complete();
        }, function(err){
          console.log(err);
          observer.error(err);
          observer.complete();
        });
      }
    );
  }
}
