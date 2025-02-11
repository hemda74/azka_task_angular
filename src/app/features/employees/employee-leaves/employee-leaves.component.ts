import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { LeaveService } from '../../../core/services/leave.service';
import { Leave } from '../../../core/models/employee.model';
import { DialogService } from '../../../core/services/dialog.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { MessageDialogComponent } from '../../../shared/components/message-dialog/message-dialog.component';

@Component({
  selector: 'app-employee-leaves',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  template: `
    <div class="leaves-section" *ngIf="isVisible">
      <div class="leave-form" style="width: 50%">
        <h3>{{ isEditing ? 'تعديل الإجازة' : 'إضافة إجازة جديدة' }}</h3>
        <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>تاريخ البداية:</label>
              <div class="input-container">
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="startDate"
                  placeholder=""
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="startPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <div
                  class="error"
                  *ngIf="leaveForm.get('startDate')?.errors?.['required'] && leaveForm.get('startDate')?.touched"
                >
                  تاريخ البداية مطلوب
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>عدد الأيام:</label>
              <div class="input-container">
                <input
                  matInput
                  type="number"
                  formControlName="duration"
                  placeholder="أدخل عدد الأيام"
                  min="1"
                  max="30"
                />
                <div
                  class="error"
                  *ngIf="
                    leaveForm.get('duration')?.errors &&
                    leaveForm.get('duration')?.touched
                  "
                >
                  <span *ngIf="leaveForm.get('duration')?.errors?.['required']">
                    عدد الأيام مطلوب
                  </span>
                  <span *ngIf="leaveForm.get('duration')?.errors?.['min']">
                    يجب أن يكون عدد الأيام أكبر من 0
                  </span>
                  <span *ngIf="leaveForm.get('duration')?.errors?.['max']">
                    لا يمكن تجاوز 30 يوم
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>نوع الإجازة:</label>
              <div class="input-container">
                <mat-select
                  formControlName="leaveType"
                  placeholder="اختر النوع"
                >
                  <mat-option value="Annual">سنوية</mat-option>
                  <mat-option value="Sick">مرضية</mat-option>
                  <mat-option value="Emergency">طارئة</mat-option>
                </mat-select>
                <div
                  class="error"
                  *ngIf="leaveForm.get('leaveType')?.errors?.['required'] && leaveForm.get('leaveType')?.touched"
                >
                  نوع الإجازة مطلوب
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!leaveForm.valid"
            >
              {{ isEditing ? 'حفظ' : 'إضافة' }}
            </button>

            <button
              *ngIf="isEditing"
              mat-raised-button
              type="button"
              (click)="cancelEdit()"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>

      <div class="leaves-list">
        <h3>قائمة الإجازات</h3>
        <table>
          <thead>
            <tr>
              <th>تاريخ البداية</th>
              <th>عدد الأيام</th>
              <th>النوع</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let leave of leaves">
              <td>{{ leave.startDate | date }}</td>
              <td>{{ leave.duration }}</td>
              <td>{{ getLeaveTypeInArabic(leave.leaveType) }}</td>
              <td>
                <button
                  mat-raised-button
                  color="accent"
                  (click)="editLeave(leave)"
                >
                  تعديل
                </button>
                <button
                  mat-raised-button
                  color="warn"
                  (click)="deleteLeave(leave.id!)"
                >
                  حذف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [
    `
      .leaves-section {
        margin-top: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .leave-form {
        margin-bottom: 30px;
      }

      .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;

        .form-group {
          flex: 1;
          min-width: 0;
        }
      }

      .form-group {
        padding: 0.5rem;
        margin-bottom: 15px;
        display: flex;
        align-items: center;

        label {
          min-width: 2rem;
          padding: 0.5rem;
          color: #555;
        }

        .input-container {
          flex: 1;
          position: relative;

          input,
          mat-select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          mat-datepicker-toggle {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }

          input[matDatepicker] {
            padding-left: 35px;
          }

          .error {
            color: red;
            font-size: 12px;
            margin-top: 5px;
            position: absolute;
            bottom: -20px;
          }
        }
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;

        th,
        td {
          padding: 12px;
          text-align: right;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }

        button {
          margin: 0 5px;
        }
      }
    `,
  ],
})
export class EmployeeLeavesComponent implements OnInit {
  @Input() isVisible: boolean = false;

  private _employeeId!: number;

  @Input()
  set employeeId(value: number) {
    console.log('Employee ID changing from', this._employeeId, 'to', value);
    if (value !== this._employeeId) {
      this._employeeId = value;
      this.leaves = [];
      if (this.isVisible) {
        console.log('Loading leaves for new employee:', value);
        this.loadLeaves();
        this.resetForm();
      }
    }
  }

  get employeeId(): number {
    return this._employeeId;
  }

  leaves: Leave[] = [];
  leaveForm!: FormGroup;
  isEditing = false;
  editingLeaveId: number | null = null;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {
    this.initForm();
  }

  ngOnInit() {
    if (this.isVisible && this.employeeId) {
      this.loadLeaves();
    }
  }

  initForm(leave?: Leave) {
    this.leaveForm = this.fb.group({
      startDate: [leave ? new Date(leave.startDate) : '', Validators.required],
      duration: [
        leave?.duration || '',
        [Validators.required, Validators.min(1), Validators.max(30)],
      ],
      leaveType: [leave?.leaveType || '', Validators.required],
    });
  }

  loadLeaves() {
    if (!this.employeeId) return;

    console.log('Loading leaves for employee:', this.employeeId);
    this.leaveService.getLeavesByEmployeeId(this.employeeId).subscribe({
      next: (leaves) => {
        console.log('Leaves received:', leaves);
        this.leaves = [...leaves];
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
        this.dialogService.showMessage(
          error.error?.message || 'فشل تحميل الإجازات',
          true
        );
      },
    });
  }

  onSubmit() {
    if (this.leaveForm.valid) {
      const formValue = this.leaveForm.value;
      const leaveData = {
        employeeId: this.employeeId,
        startDate: formValue.startDate.toISOString(),
        duration: formValue.duration,
        leaveType: formValue.leaveType,
      };

      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: '400px',
        data: {
          message: this.isEditing
            ? 'هل أنت متأكد من تعديل هذه الإجازة؟'
            : 'هل أنت متأكد من إضافة هذه الإجازة؟',
          isConfirmation: true,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (this.isEditing && this.editingLeaveId) {
            this.leaveService
              .updateLeave(this.editingLeaveId, leaveData)
              .subscribe({
                next: () => {
                  this.loadLeaves();
                  this.resetForm();
                  this.dialogService.showMessage(
                    'تم تحديث الإجازة بنجاح',
                    false
                  );
                },
                error: (error) => {
                  this.dialogService.showMessage(
                    error.error?.message || 'فشل تحديث الإجازة',
                    true
                  );
                },
              });
          } else {
            this.leaveService
              .addLeave({ ...leaveData, status: 'Pending' })
              .subscribe({
                next: () => {
                  this.loadLeaves();
                  this.resetForm();
                  this.dialogService.showMessage(
                    'تم إضافة الإجازة بنجاح',
                    false
                  );
                },
                error: (error) => {
                  this.dialogService.showMessage(
                    error.error?.message || 'فشل إضافة الإجازة',
                    true
                  );
                },
              });
          }
        }
      });
    }
  }

  editLeave(leave: Leave) {
    this.isEditing = true;
    this.editingLeaveId = leave.id!;
    this.initForm(leave);
  }

  deleteLeave(id: number) {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '400px',
      data: {
        message: 'هل أنت متأكد من حذف هذه الإجازة؟',
        isConfirmation: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.leaveService.deleteLeave(id, this.employeeId).subscribe({
          next: () => {
            this.loadLeaves();
            this.dialogService.showMessage('تم حذف الإجازة بنجاح');
          },
          error: (error) => {
            this.dialogService.showMessage(
              error.error.message || 'فشل حذف الإجازة',
              true
            );
          },
        });
      }
    });
  }

  resetForm() {
    this.isEditing = false;
    this.editingLeaveId = null;
    this.initForm();
    this.leaveForm.reset({
      startDate: '',
      duration: '',
      leaveType: '',
    });
  }

  cancelEdit() {
    this.resetForm();
  }

  getLeaveTypeInArabic(type: string): string {
    const types = {
      Annual: 'سنوية',
      Sick: 'مرضية',
      Emergency: 'طارئة',
    };
    return types[type as keyof typeof types] || type;
  }
}
