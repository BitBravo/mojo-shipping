import {Component, OnInit} from "@angular/core";
import {LocationDetail} from "../model/location/LocationDetail";
import {GlobalScopeService} from "../service/global-scope.service";

@Component({
  selector: 'app-location-selection',
  templateUrl: '../template/location-selection.component.html',
  styleUrls: ['../style/location-selection.component.css']
})
export class LocationSelectionComponent implements OnInit {

  public locations: LocationDetail[];

  constructor(public _gs: GlobalScopeService) {
  }

  ngOnInit() {
    this.locations = this._gs.LOCATIONS as LocationDetail[];
    if (this._gs.userTimeout)
      window.clearTimeout(this._gs.userTimeout);
  }
}
