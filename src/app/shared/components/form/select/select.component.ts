import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';

export interface Option {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  imports:[CommonModule],
  templateUrl: './select.component.html',
})
export class SelectComponent implements OnInit {
  @Input() options: Option[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() className: string = '';
  @Input() defaultValue: string = '';
  @Input() value: string = '';
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  constructor(public cdref:ChangeDetectorRef){}

  ngOnInit() {
    if (!this.value && this.defaultValue) {
      this.value = this.defaultValue;
      this.cdref.detectChanges();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.value = changes['value'].currentValue;
      this.cdref.detectChanges();
    }
  }

  onChange(event: Event) {
    if(this.disabled){
      event.stopPropagation();
      return;
    } 
    const value = (event.target as HTMLSelectElement).value;
    this.value = value;
    this.valueChange.emit(value);
  }
}