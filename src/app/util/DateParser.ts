import {Injectable} from "@angular/core";
import {NgbDateParserFormatter, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

function isNumber(value: any): boolean {
  return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

@Injectable()
export class NgbDateFRParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return {year: toInteger(dateParts[0]), month: null, day: null};
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return {year: toInteger(dateParts[1]), month: toInteger(dateParts[0]), day: null};
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return {year: toInteger(dateParts[2]), month: toInteger(dateParts[1]), day: toInteger(dateParts[0])};
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    let stringDate: string = "";
    if (date) {
      let formatDate: Date = new Date();
      formatDate.setFullYear(date.year, date.month - 1, date.day);
      return formatDate.toDateString();
    }
    return stringDate;
  }
}
