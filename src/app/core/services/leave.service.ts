import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Leave, ServiceResponse } from '../models/employee.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private apiUrl = 'https://localhost:7261/api/Leave';
  private leaveUpdated = new Subject<number>();

  leaveUpdated$ = this.leaveUpdated.asObservable();

  constructor(private http: HttpClient) {}

  getLeavesByEmployeeId(employeeId: number): Observable<Leave[]> {
    console.log('Fetching leaves for employee:', employeeId);
    return this.http.get<Leave[]>(`${this.apiUrl}/employee/${employeeId}`).pipe(
      tap((leaves) => {
        console.log('Leaves received:', leaves);
      })
    );
  }

  addLeave(leave: Leave): Observable<ServiceResponse<Leave>> {
    console.log('Sending leave data:', leave);
    return this.http.post<ServiceResponse<Leave>>(this.apiUrl, leave).pipe(
      tap((response) => {
        console.log('Leave add response:', response);
        this.leaveUpdated.next(leave.employeeId);
      })
    );
  }

  updateLeave(id: number, updates: Partial<Leave>): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(() => {
        console.log('Leave updated');
        if (updates.employeeId) {
          this.leaveUpdated.next(updates.employeeId);
        }
      })
    );
  }

  deleteLeave(id: number, employeeId: number): Observable<void> {
    console.log('Deleting leave:', { id, employeeId });
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('Leave delete successful');
        this.leaveUpdated.next(employeeId);
      })
    );
  }
}
