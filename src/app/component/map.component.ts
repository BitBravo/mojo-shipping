import {Component, OnInit, Input} from "@angular/core";
import {LocationDetail} from "../model/location/LocationDetail";

@Component({
  selector: 'app-map',
  templateUrl: '../template/map.component.html',
  styleUrls: ['../style/map.component.css']
})

export class MapComponent implements OnInit {

  @Input()
  public locations: LocationDetail[];
  public lat: number;
  public lng: number;
  public zoom: number;
  public latitute: number;
  public longitute: number;

  constructor() {
    this.locations = [];
  }

  ngOnInit() {
    if (navigator.geolocation) {  
      navigator.geolocation.getCurrentPosition(position => {
        this.latitute=position.coords.latitude;
        this.longitute=position.coords.longitude;
      }); 
  } else {  
      alert("There is Some Problem on your current browser to get Geo Location!");  
  }  
  }

  onLocationSelected(location: LocationDetail) {
    if (location.lastLocation == null)
      return;
    this.lat = location.lastLocation.latitude;
    this.lng = location.lastLocation.longitude;
    this.zoom = 14;
  }
}
