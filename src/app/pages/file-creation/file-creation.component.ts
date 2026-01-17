import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { UtilityService } from '../../shared/services/utility.service';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { MetadataRegistryService, MetadataRegistry } from '../../shared/services/metadata-registry.service';
import { ComponentType } from '../../shared/services/component-type.service';
import { NotificationService } from '../../shared/services/notification.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { MultiSelectComponent } from '../../shared/components/form/multi-select/multi-select.component';
import { FileCreationService } from '../../shared/services/file-creation.service';
import { isArray } from 'lodash';
import { DropdownManagementService } from '../../shared/services/dropdown-management.service';

@Component({
  selector: 'app-file-creation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MultiSelectComponent,
    SelectComponent,
    JsonPipe],
  templateUrl: './file-creation.component.html',
  styleUrl: './file-creation.component.css'
})
export class FileCreationComponent implements OnInit {

  metadataRegistries: MetadataRegistry[] = [];
  componentTypes: ComponentType[] = [];
  componentTypeOptions: Option[] = [];
  dropdowns: any[] = []; 
  form!: FormGroup;

  constructor(
    private metadataRegistryService: MetadataRegistryService,
    public utilityService: UtilityService,
    public notificationService: NotificationService,
    private fb: FormBuilder,
    private fileCreationService:FileCreationService,
    private dropdownManagementService: DropdownManagementService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});
    this.loadComponentTypes();
    this.loadMetadataRegistries();
    this.loadDropDowns();
  }

  loadComponentTypes() {
    this.metadataRegistryService.getComponentTypes().subscribe({
      next: (data: ComponentType[]) => {
        this.componentTypes = data;
        this.componentTypeOptions =
          this.metadataRegistryService.convertToOptions(data);
      },
      error: (err) => {
        this.notificationService.error(
          'Something went wrong while loading component types'
        );
        console.error(err);
      }
    });
  }

  loadMetadataRegistries() {
    this.metadataRegistryService.getMetadataRegistries().subscribe({
      next: (data: MetadataRegistry[]) => {
        this.metadataRegistries = data;
        console.log("this.metadataRegistries",this.metadataRegistries);
        
        this.buildDynamicForm();
      },
      error: (err) => {
        this.notificationService.error(
          'Something went wrong while loading metadata list'
        );
        console.error(err);
      }
    });
  }

  loadDropDowns(){
    this.dropdownManagementService.getDropdowns().subscribe({
      next: (data: any[]) => {
        this.dropdowns = data;
        this.dropdowns.map((dd)=>{
          dd.value = String(dd.dropdown_id);
          dd.label = dd.name
          return dd;
         })
      },
      error: (err) => {
        this.notificationService.error('Something went wrong while loading Dropdown list');
        console.error('Failed to load Dropdown list:', err);
      }
    })
  }

  // buildDynamicForm() {
  //   this.metadataRegistries.forEach(metadata => {
  //     const validators = metadata.isrequired ? [Validators.required] : [];
  //     if (metadata.ismultiple) {
  //       this.form.addControl(
  //         metadata.key,
  //         this.fb.array([
  //           new FormControl('', validators)
  //         ])
  //       );
  //     } else {
  //       this.form.addControl(
  //         metadata.key,
  //         new FormControl('', validators)
  //       );
  //     }
  //   });
  // }

  buildDynamicForm() {
  this.metadataRegistries.forEach(metadata => {
    const validators = metadata.isrequired ? [Validators.required] : [];
    const formKey = metadata.metadata_registry_id.toString();

    if (metadata.ismultiple) {
      this.form.addControl(
        formKey,
        this.fb.array([new FormControl(null, validators)])
      );
    } else {
      this.form.addControl(
        formKey,
        new FormControl(null, validators)
      );
    }
  });
}


getFormArray(id: number): FormArray {
  return this.form.get(id.toString()) as FormArray;
}

  addMore(meta: MetadataRegistry) {
    this.getFormArray(meta.metadata_registry_id).push(
      new FormControl(null, meta.isrequired ? Validators.required : null)
    );
  }

 formatDateInput(event: Event, controlName: string) {
  const input = event.target as HTMLInputElement;
  const control = this.form.get(controlName);

  if (!control) return;

  // Remove non-digits
  let digits = input.value.replace(/\D/g, '').substring(0, 8);

  const day = digits.substring(0, 2);
  const month = digits.substring(2, 4);
  const year = digits.substring(4, 8);

  let formatted = '';

  if (day) formatted = day;
  if (month) formatted += '-' + month;
  if (year) formatted += '-' + year;

  // Set formatted value
  control.setValue(formatted, { emitEvent: false });

  // Validate only when full date is entered
  if (digits.length === 8) {
    const isValid = this.utilityService.isValidDate(
      Number(day),
      Number(month),
      Number(year)
    );

    if (!isValid) {
      control.setErrors({ invalidDate: true });
    } else {
      // Remove only invalidDate error (keep others like required)
      if (control.hasError('invalidDate')) {
        const errors = { ...control.errors };
        delete errors['invalidDate'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  } else {
    // Clear invalidDate error if user is still typing
    if (control.hasError('invalidDate')) {
      const errors = { ...control.errors };
      delete errors['invalidDate'];
      control.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
}


  getValueByMetadataKey(key: string): any {
    const meta = this.metadataRegistries.find(m => m.key === key);
    return meta
      ? this.form.get(meta.metadata_registry_id.toString())?.value
      : null;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Please fill all required fields');
      return;
    }
    const fileName = `${this.getValueByMetadataKey('dc.caseTitle')}_${this.getValueByMetadataKey('dc.caseYear')}`;
    let payload:any = {items:[], file_name:`${fileName}`};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if(isArray(control?.value)){
        control?.value.forEach((val: any) => {
          if(val != null){
            payload.items.push({
              metadata_registry_id: Number(key),
              value: val
            });
          }
        });
      }else{
        if(control?.value != null){
          payload.items.push({
            metadata_registry_id: Number(key),
            value: control?.value
          });
        }
      }
    });
    this.fileCreationService.submitMetadataForm(payload).subscribe({
      next: (resp) => {
        this.notificationService.success('Metadata submitted successfully');
        this.resetForm();
      },
      error: (err) => {
        this.notificationService.error('Failed to submit metadata');
        console.error(err);
      }
    });
  }

  //This will extract the optiosn from the dropdown list based on dropdown_id
  getOptionsFromId(dropdownId:number|undefined):any[]{
    if(dropdownId == undefined) return[];
    let index = this.dropdowns.findIndex((dd)=>{
      return dd.dropdown_id == dropdownId
    })
    return this.dropdowns[index]?.options;
  }


  removeAt(meta: MetadataRegistry, index: number) {
    const arr = this.getFormArray(meta.metadata_registry_id);

    // Optional safety: keep at least one control
    if (arr.length > 1) {
      arr.removeAt(index);
    }
  }

  resetForm() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);

      if (control instanceof FormArray) {
        control.clear();
        control.push(new FormControl(null));
      }
      this.form.reset();
    });
  }
}
