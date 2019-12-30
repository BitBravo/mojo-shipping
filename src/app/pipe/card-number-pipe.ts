import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'cardNumberPipe'
})

export class CardNumberPipe implements PipeTransform {
  transform(value: string): string {
    if (value == null)
      return value;
    while (value.includes("-"))
      value = value.replace("-", "");
    while (value.includes(" "))
      value = value.replace(" ", "");
    let numbersarray: string[] = value.split("");
    let index = 4;
    while (index < numbersarray.length) {
      numbersarray.splice(index, 0, "-");
      index = index + 5;
    }
    return numbersarray.join("");
  }
}
