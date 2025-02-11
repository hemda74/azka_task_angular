import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: EmployeeListComponent },
  { path: 'new', component: EmployeeFormComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    EmployeeFormComponent,
    FormsModule,
    SharedModule,
    EmployeeListComponent,
  ],
  exports: [EmployeeListComponent],
})
export class EmployeesModule {}
