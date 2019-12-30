import {Component, OnInit} from "@angular/core";
import {LoginService} from "../service/login.service";
import {SESSION_TOKEN_PREF_KEY} from "../config/global-config";
import {Router} from "@angular/router";
import { GlobalScopeService } from "../service/global-scope.service";

@Component({
  selector: 'app-login',
  templateUrl: '../template/login.component.html',
  styleUrls: ['../style/login.component.css']
})
export class LoginComponent implements OnInit {

  public loading: boolean;
  public error: boolean;

  constructor(private loginService: LoginService, private globalScope:GlobalScopeService ,private router: Router) {
    this.loading = false;
    this.error = false;
  }

  ngOnInit() {
  }

  login(event, username, password) {
    this.loading = true;
    event.preventDefault();
    this.loginService.login(username, password).subscribe(response => {
      let token: string = response.sessionToken;
      if (token != null) {
        localStorage.setItem(SESSION_TOKEN_PREF_KEY, token);
        // this.router.navigateByUrl('locationselection');
        if(this.globalScope.SOURCE_ID){
          this.router.navigate(['/locationselection'], { queryParams: { sourceId: this.globalScope.SOURCE_ID }, skipLocationChange:true });
        }
        else {
          this.router.navigate(['/locationselection'],{skipLocationChange:true});
        }
      } else {
        this.error = true;
      }
      this.loading = false;
    });
  }
}
