import {LocationDetail} from "../model/location/LocationDetail";
import { GlobalScopeService } from "../service/global-scope.service";
export class LocationUtil {

  constructor(private globalScopeService:GlobalScopeService){}

  getStatus(location: LocationDetail): string {
    let status: string = location.currentStatus;
    if (status.includes("CLOSE"))
      return null;
    if (status.includes("OFFLINE"))
      return "OPEN";
    return status;
  }

  getButtonText(location: LocationDetail): string {
    let status: string = location.currentStatus;
    if (this.isReadOnlyMenu(location))
        return "VIEW MENU";
    if (status.includes("OFFLINE") || status.includes("CLOSE")) {
      if (location.next7DayEvents)
        return "ORDER FOR LATER";
      return "VIEW MENU";
    }
    return "ORDER NOW";
  }

   getCateringButtonText(location: LocationDetail): string {
    let status: string = location.currentStatus;
    if (this.isReadOnlyMenu(location))
        return "VIEW CATERING MENU";
    if (status.includes("OFFLINE") || status.includes("CLOSE")) {
      if (location.next7DayEvents)
        return "ORDER CATERING";
    }
    return "ORDER CATERING";
  }

  isReadOnlyMenu(location: LocationDetail): boolean {
    if(!this.globalScopeService.VIEW_MENU){
      return (location.currentStatus.includes("OFFLINE") || location.currentStatus.includes("CLOSE")) && !location.next7DayEvents;
    }
    else  {
      return (location.currentStatus.includes("OFFLINE") || location.currentStatus.includes("CLOSE") || location.currentStatus.includes("OPEN"));
    }
  }
}
