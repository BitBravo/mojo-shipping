import {Component, OnInit} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {kioskSetting} from "../model/kios-setting";
import {KIOSK_PREF_KEY} from "../config/global-config";

@Component({
  selector: 'app-kiosk-setting',
  templateUrl: '../template/kiosk-setting.component.html',
  styleUrls: ['../style/kiosk-setting.component.css']
})
export class KioskSettingComponent implements OnInit {

  private model: kioskSetting;

  constructor(private modalService: NgbModal) {
    let settings: any = localStorage.getItem(KIOSK_PREF_KEY);
    if (settings == null) {
      this.model = new kioskSetting();
    } else {
      this.model = JSON.parse(settings);
    }
  }

  ngOnInit() {
  }

  open(content) {
    this.modalService.open(content).result.then((result) => {
      localStorage.setItem(KIOSK_PREF_KEY, JSON.stringify(this.model));
    }, (reason) => {
    });
  }
}
