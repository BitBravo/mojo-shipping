import {Component, OnInit, Input} from "@angular/core";
import {GoogleMapsAPIWrapper} from "angular2-google-maps/core";
import {LocationDetail} from "../model/location/LocationDetail";

declare var google: any;

@Component({
  selector: 'app-map-bound',
  templateUrl: '../template/map-bound.component.html',
  styleUrls: ['../style/map-bound.component.css']
})
export class MapBoundComponent implements OnInit {

  @Input()
  private locations: LocationDetail[];

  constructor(private _mapWrapper: GoogleMapsAPIWrapper) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    if (this.locations == null)
      return;
    this._mapWrapper.getNativeMap().then(map => {
      var bounds = new google.maps.LatLngBounds();
      for (let location of this.locations) {
        if (location.lastLocation == null)
          continue;
        var Item = new google.maps.LatLng(this.locations[0].lastLocation.latitude, this.locations[0].lastLocation.longitude);
        //bounds.extend(Item);
        map.setCenter(Item);
        map.setZoom(14);
      }
      //map.fitBounds(bounds);
    });
  }
}
