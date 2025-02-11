import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Employee } from '../../../core/models/employee.model';
import { MY_DATE_FORMATS } from '../../../core/configs/date-formats.config';

@Component({
  selector: 'app-edit-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
  ],
  providers: [
    MatDatepickerModule,
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  template: `
    <h2 mat-dialog-title>Edit Employee</h2>
    <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Date of Birth</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="dateOfBirth"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Qualification</mat-label>
          <mat-select formControlName="qualification">
            <mat-option value="High School">High School</mat-option>
            <mat-option value="Bachelor">Bachelor</mat-option>
            <mat-option value="Master">Master</mat-option>
            <mat-option value="PhD">PhD</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button type="button" (click)="onNoClick()">Cancel</button>
        <button
          mat-button
          color="primary"
          type="submit"
          [disabled]="!employeeForm.valid"
        >
          Save
        </button>
        <button mat-button color="accent" type="button" (click)="viewLeaves()">
          View Leaves
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 400px;
      }
      mat-dialog-actions {
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
})
export class EditEmployeeDialogComponent {
  employeeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee }
  ) {
    this.employeeForm = this.fb.group({
      name: [data.employee.name, Validators.required],
      dateOfBirth: [new Date(data.employee.dateOfBirth), Validators.required],
      qualification: [data.employee.qualification, Validators.required],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      const updates = {
        name: formValue.name,
        dateOfBirth: formValue.dateOfBirth.toISOString(),
        qualification: formValue.qualification,
      };
      console.log('Submitting form with values:', updates);
      this.dialogRef.close(updates);
    }
  }

  viewLeaves(): void {
    this.dialogRef.close({
      action: 'viewLeaves',
      employeeId: this.data.employee.id,
    });
  }
}
