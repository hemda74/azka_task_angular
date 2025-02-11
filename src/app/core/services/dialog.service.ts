import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MessageDialogComponent } from '../../shared/components/message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  showMessage(message: string, isError: boolean = false) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.data = {
      message,
      isError,
      isConfirmation: false,
    };

    this.dialog.open(MessageDialogComponent, dialogConfig);
  }
}
