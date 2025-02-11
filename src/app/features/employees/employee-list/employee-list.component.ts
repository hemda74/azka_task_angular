import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationComponent } from '../pagination/pagination.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EditEmployeeDialogComponent } from '../edit-employee-dialog/edit-employee-dialog.component';
import { ViewLeavesDialogComponent } from '../view-leaves-dialog/view-leaves-dialog.component';
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
import { EmployeeLeavesComponent } from '../employee-leaves/employee-leaves.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaveService } from '../../../core/services/leave.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../../../shared/components/message-dialog/message-dialog.component';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    EmployeeLeavesComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employeeForm!: FormGroup;
  employees: Employee[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  isEditing = false;
  editingEmployeeId: number | null = null;
  errorMessage: string = '';
  selectedEmployeeId: number | null = null;
  showLeaves = false;
  private destroy$ = new Subject<void>();

  private qualifications: { [key: string]: string } = {
    'High School': 'ثانوية عامة',
    Bachelor: 'بكالوريوس',
    Master: 'ماجستير',
    PhD: 'دكتوراه',
  };

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    this.initForm();
  }
  ngOnInit() {
    this.getEmployees();

    this.leaveService.leaveUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((employeeId) => {
        console.log('Leave updated for employee:', employeeId);
        this.getEmployees();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getEmployees() {
    console.log('Fetching employees list...');
    this.employeeService
      .getEmployees(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          console.log('Employee list received:', response);
          this.employees = [...response.data];
          this.totalItems = response.total;
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error fetching employees:', error);
          this.errorMessage =
            error.error?.message || 'Failed to load employees';
        },
      });
  }

  initForm(employee?: Employee) {
    this.employeeForm = this.fb.group({
      id: [{ value: employee?.id || '', disabled: true }],
      name: [employee?.name || '', Validators.required],
      dateOfBirth: [
        employee ? new Date(employee.dateOfBirth) : '',
        Validators.required,
      ],
      qualification: [employee?.qualification || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const employeeData = {
        name: this.employeeForm.value.name,
        dateOfBirth: this.employeeForm.value.dateOfBirth,
        qualification: this.employeeForm.value.qualification,
      };

      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: '400px',
        data: {
          message: this.isEditing
            ? 'هل أنت متأكد من تعديل بيانات هذا الموظف؟'
            : 'هل أنت متأكد من إضافة هذا الموظف؟',
          isConfirmation: true,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (this.isEditing && this.editingEmployeeId) {
            this.employeeService
              .updateEmployee(this.editingEmployeeId, employeeData)
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    this.getEmployees();
                    this.resetForm();
                    this.dialogService.showMessage(
                      response.message || 'تم تحديث بيانات الموظف بنجاح',
                      false
                    );
                  } else {
                    this.dialogService.showMessage(
                      response.message || 'فشل تحديث بيانات الموظف',
                      true
                    );
                  }
                },
                error: (error) => {
                  this.dialogService.showMessage(
                    error.error?.message || 'فشل تحديث بيانات الموظف',
                    true
                  );
                },
              });
          } else {
            this.employeeService.addEmployee(employeeData).subscribe({
              next: (response) => {
                if (response.success) {
                  this.getEmployees();
                  this.resetForm();
                  this.dialogService.showMessage(
                    response.message || 'تم إضافة الموظف بنجاح',
                    false
                  );
                } else {
                  this.dialogService.showMessage(
                    response.message || 'فشل إضافة الموظف',
                    true
                  );
                }
              },
              error: (error) => {
                this.dialogService.showMessage(
                  error.error?.message || 'فشل إضافة الموظف',
                  true
                );
              },
            });
          }
        }
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.editingEmployeeId = null;
    this.initForm();
    this.employeeForm.markAsPristine();
    this.employeeForm.markAsUntouched();
  }

  editEmployee(employee: Employee) {
    this.isEditing = true;
    this.editingEmployeeId = employee.id;
    this.initForm(employee);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.resetForm();
  }

  deleteEmployee(id: number) {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '400px',
      data: {
        message: 'هل أنت متأكد من حذف هذا الموظف؟',
        isConfirmation: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: (response) => {
            if (response.success) {
              this.getEmployees();
              this.dialogService.showMessage(
                response.message || 'تم حذف الموظف بنجاح',
                false
              );
            } else {
              this.dialogService.showMessage(
                response.message || 'فشل حذف الموظف',
                true
              );
            }
          },
          error: (error) => {
            this.dialogService.showMessage(
              error.error?.message || 'فشل حذف الموظف',
              true
            );
          },
        });
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.currentPage = page;
      this.getEmployees();
    }
  }

  getQualificationInArabic(qualification: string): string {
    return this.qualifications[qualification] || qualification;
  }

  viewEmployeeLeaves(employeeId: number) {
    console.log('Viewing leaves for employee:', employeeId);

    this.showLeaves = false;
    this.selectedEmployeeId = null;
    setTimeout(() => {
      this.selectedEmployeeId = employeeId;
      this.showLeaves = true;
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
