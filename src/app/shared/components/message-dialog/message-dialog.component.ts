import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <div
      class="dialog-container"
      [class]="data.isError ? 'error-dialog' : 'success-dialog'"
      dir="rtl"
    >
      <h2 class="dialog-title">
        {{ data.isConfirmation ? 'تأكيد' : data.isError ? 'خطأ' : 'نجاح' }}
      </h2>
      <div class="dialog-content">
        {{ data.message }}
      </div>
      <div class="dialog-actions">
        <button
          mat-raised-button
          color="primary"
          (click)="confirm()"
          *ngIf="data.isConfirmation"
        >
          نعم
        </button>
        <button mat-raised-button (click)="close()">
          {{ data.isConfirmation ? 'لا' : 'إغلاق' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 20px;
        border-radius: 8px;
      }
      .dialog-title {
        margin: 0 0 20px 0;
        font-size: 1.5em;
      }
      .dialog-content {
        margin-bottom: 20px;
        font-size: 1.1em;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-start;
        gap: 10px;
      }
      .error-dialog {
        background-color: #fff3f3;
        .dialog-title {
          color: #721c24;
        }
      }
      .success-dialog {
        background-color: #f3fff3;
        .dialog-title {
          color: #155724;
        }
      }
      button {
        min-width: 100px;
      }
    `,
  ],
})
export class MessageDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
      isError: boolean;
      isConfirmation?: boolean;
    },
    private dialogRef: MatDialogRef<MessageDialogComponent>
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
