import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class LoginService {

  constructor(private _httpService: HttpService) {
  }

  login(username: string, password: string): Observable<any> {
    return Observable.create(observer => {
        this._httpService.getDataWithRequest("userLogin", {
          userName: username,
          password: password
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }
}
