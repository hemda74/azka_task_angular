import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Leave } from '../../../core/models/employee.model';
import { LeaveService } from '../../../core/services/leave.service';

@Component({
  selector: 'app-view-leaves-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule],
  template: `
    <h2 mat-dialog-title>Employee Leaves</h2>
    <mat-dialog-content>
      <table mat-table [dataSource]="leaves">
        <ng-container matColumnDef="leaveType">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let leave">{{ leave.leaveType }}</td>
        </ng-container>

        <ng-container matColumnDef="startDate">
          <th mat-header-cell *matHeaderCellDef>Start Date</th>
          <td mat-cell *matCellDef="let leave">{{ leave.startDate | date }}</td>
        </ng-container>

        <ng-container matColumnDef="duration">
          <th mat-header-cell *matHeaderCellDef>Duration (days)</th>
          <td mat-cell *matCellDef="let leave">{{ leave.duration }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      table {
        width: 100%;
      }
      .mat-column-duration {
        text-align: right;
      }
    `,
  ],
})
export class ViewLeavesDialogComponent implements OnInit {
  leaves: Leave[] = [];
  displayedColumns: string[] = ['leaveType', 'startDate', 'duration'];

  constructor(
    private leaveService: LeaveService,
    public dialogRef: MatDialogRef<ViewLeavesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employeeId: number }
  ) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getLeavesByEmployeeId(this.data.employeeId).subscribe({
      next: (leaves) => {
        this.leaves = leaves;
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
      },
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
