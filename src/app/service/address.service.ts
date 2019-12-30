import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Http, Headers, RequestOptions} from "@angular/http";


@Injectable()
export class AddressService {

  constructor(private _http: Http) {
  }

  private getData(url: string): Observable<any> {
    return Observable.create(observer => {
        this._http
          .get(url).subscribe(response => {
          observer.next(response.json());
          observer.complete();
        });
      }
    );
  }

  getAddress(latitude: number, longitude: number): Observable<string> {
    return Observable.create(observer => {
        this.getData("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude).subscribe(response => {
          observer.next(response.results[0].formatted_address);
          observer.complete();
        });
      }
    );
  }

  // getAddressFromPlaceId(placeId: string): Observable<string> {
  //   return Observable.create(observer => {
  //       this.getData("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId).subscribe(response => {
  //         observer.next(response.results[0].formatted_address);
  //         observer.complete();
  //       });
  //     }
  //   );
  // }

  getCurrentAddress(latitude: number, longitude: number): Observable<any> {
    return Observable.create(observer => {
        this.getData("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude).subscribe(response => {
          observer.next(response);
          observer.complete();
        });
      }
    );
  }

  

  // getDistance(originLatitude: number, originLongitude: number, destLatitude: number, destLongitude: number): Observable<number> {
  //   console.log('gettingdistance');
  //   return Observable.create(observer => {
  //       this.getData("https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + originLatitude + ',' + originLongitude + "&destinations=" + destLatitude + "," + destLongitude).subscribe(response => {
  //         console.log(response);
  //         observer.next(response.rows[0].elements[0].distance.value);
  //         observer.complete();
  //       });
  //     }
  //   );
  // }

  getDistance(lat1, lon1, lat2, lon2): number {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    dist = dist * 0.621371;
    return dist;
  }
}
