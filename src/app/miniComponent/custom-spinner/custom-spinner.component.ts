import { Component, OnInit, Input ,Output ,EventEmitter,AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-custom-spinner',
  templateUrl: './custom-spinner.component.html',
  styleUrls: ['./custom-spinner.component.css']
})
export class CustomSpinnerComponent implements AfterViewInit {

  @Input() min: number;
  @Input() max: number;
  @Output() OnValueChange :EventEmitter<string>;
  @Input() value: string;

  disabledMinus: boolean = false;
  disabledPlus: boolean = false;

  constructor() {

    this.OnValueChange = new EventEmitter();
  }

   ngAfterViewInit() {
    // if (this.min !== undefined && this.value == undefined) {
    //    this.value = this.min.toString();
    // }
  }
  

  increment() {

    let currentParsedVal: number = parseInt(this.value);

    if (!isNaN(currentParsedVal)) {

      if (this.disabledMinus === true)
        this.disabledMinus = false;

      if (currentParsedVal < this.max || this.max === undefined) {
        this.value = (currentParsedVal + 1).toString();
      }
      if (parseInt(this.value) == this.max) {
        this.disabledPlus = true;
      }
    }

    this.OnValueChange.emit(this.value);
  }


  decrement() {
    let currentParsedVal: number = parseInt(this.value);
    if (!isNaN(currentParsedVal)) {
      if (this.disabledPlus === true)
        this.disabledPlus = false;

      if (currentParsedVal > this.min || this.min === undefined) {
        this.value = (currentParsedVal - 1).toString();
      }
      if ( parseInt(this.value)== this.min) {
        this.disabledMinus = true;
      }
    }

    this.OnValueChange.emit(this.value);
  }


  handleInputChange(event) {

    let minValue = this.min;
    let maxValue = this.max;
    let valueCurrent = parseInt(event.target.value);

    if (minValue == undefined || valueCurrent >= minValue) {
      this.disabledMinus = false;
         this.value = event.target.value;

    } else {
      console.log('Sorry, the minimum value was reached');
      this.value = this.min.toString();
      this.disabledMinus = true;
    }
    if (maxValue == undefined || valueCurrent <= maxValue) {
      this.disabledPlus = false;
         this.value = event.target.value;
    } else {
      console.log('Sorry, the maximum value was reached');
      this.value = this.max.toString();
      this.disabledPlus = true;
     
    }

 
    this.OnValueChange.emit(this.value);
    
  }

  handleKeyDown(e) {

    // Allow: backspace, delete, tab, escape, enter and .
    if ([46, 8, 9, 27, 13, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }

  }
}
