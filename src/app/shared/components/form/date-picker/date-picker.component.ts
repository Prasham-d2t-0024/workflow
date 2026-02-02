import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import flatpickr from 'flatpickr';
import { LabelComponent } from '../label/label.component';
import "flatpickr/dist/flatpickr.css";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { forwardRef } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule, LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ]
})
export class DatePickerComponent implements ControlValueAccessor {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;
  value: string | null = null;
  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };
  writeValue(value: string | null): void {
    this.value = value;

    // This is what makes form.reset() work
    if (this.flatpickrInstance) {
      if (value) {
        this.flatpickrInstance.setDate(value, false);
      } else {
        this.flatpickrInstance.clear();
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.dateInput) {
      this.dateInput.nativeElement.disabled = isDisabled;
    }
  }

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngAfterViewInit() {
    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
      mode: this.mode,
      dateFormat: 'd-m-Y',
      defaultDate: this.defaultDate,
      onChange: (selectedDates, dateStr) => {
        this.value = dateStr;
        this.onChange(dateStr);
        this.onTouched();
        this.dateChange.emit({ selectedDates, dateStr });
      },
    });
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
