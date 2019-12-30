import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {Observable} from "rxjs/Observable";
import {GlobalScopeService} from "./global-scope.service";


@Injectable()
export class ScheduleService {

  constructor(private _httpService: HttpService, private _globalScope: GlobalScopeService) {
  }

  getSchedule(truckIdVal: string, startTime: Date, endTime: Date): Observable<any> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("truckScheduleGet", {
          vendorId: this._globalScope.VENDOR_ID,
          truckId: truckIdVal,
        fromTimeStamp: new Date(startTime.toUTCString()).toISOString(),
        toTimeStamp: new Date(endTime.toUTCString()).toISOString()
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }
}
