import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ModalComponent } from './components/modal/modal.component';
import { CeilPipe } from './components/ceilPipe/ceil.pipe';
@NgModule({
  declarations: [PaginationComponent, ModalComponent, CeilPipe],
  imports: [CommonModule],
  exports: [PaginationComponent, ModalComponent, CeilPipe],
})
export class SharedModule {}
