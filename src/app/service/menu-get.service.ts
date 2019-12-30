import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class MenuGetService{
  public resultObject: any[];

  constructor(private _httpService: HttpService) {
    this.resultObject = [];
  }

  getMenuItemsForCategory(categoryId:string, truckId:string, limit:number, skip:number, searchTerm:string):Observable<any> {
    console.info(this);
    return Observable.create(observer => {
    //before calling the http service, see if you can all ready have the data cached
      if (!searchTerm || searchTerm == "")
        for (let resultEntry of this.resultObject) {
          if (resultEntry.categoryId == categoryId 
          && resultEntry.truckId == truckId
          && resultEntry.limit == limit
          && resultEntry.skip == skip){
            observer.next(resultEntry.response);
            observer.complete();
          }
        };
      this._httpService.getDataWithRequest("menuItemsGetForCategory", {
          menuCategory:{
            className:"MenuCategory",
            objectId:categoryId,
            __type:"Pointer",
          },
          truck:truckId,
          searchTerm:searchTerm,
          limit:limit*2, //get this and the next page
          skip:skip,
          clientType:"WEBAPP"

        }).subscribe(response => {
          if (!searchTerm){
            this.resultObject.push({categoryId: categoryId, truckId: truckId, limit:limit, skip:skip, response:response.slice(0,limit)});
            //cache the next page
            this.resultObject.push({categoryId: categoryId, truckId: truckId, limit:limit, skip:skip+limit, response:response.slice(limit)});
          };
          //return the requested page
          observer.next(response.slice(0, limit));
          observer.complete();
        }, err =>{
          console.log(err);
          observer.error(err);
          observer.complete();
        });
      }
    );
  }


  getMenu(menuId: string, locationId: string): Observable<any> {
    return Observable.create(observer => {
      this._httpService.getDataWithRequest("menuGetDetail", {
          menuId: menuId,
          truckId: locationId,
          noMenuItems:true
        }).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }
}
