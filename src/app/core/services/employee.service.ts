import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Employee, ServiceResponse } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = 'https://localhost:7261/api/Employee';
  private employeesRefresh = new Subject<void>();
  private refreshRequired = new Subject<void>();

  employeesRefresh$ = this.employeesRefresh.asObservable();
  refreshRequired$ = this.refreshRequired.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees(
    page: number = 1,
    pageSize: number = 5
  ): Observable<{
    data: Employee[];
    total: number;
  }> {
    console.log('Fetching employees, page:', page);
    return this.http
      .get<Employee[]>(this.apiUrl, {
        params: {
          page: page.toString(),
          pageSize: pageSize.toString(),
        },
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          console.log('Raw employee response:', response);
        }),
        map((response) => {
          const total = Number(response.headers.get('X-Total-Count') || 0);
          const result = {
            data: [...(response.body || [])],
            total: total,
          };
          console.log('Processed employee data:', result);
          return result;
        })
      );
  }

  deleteEmployee(id: number): Observable<ServiceResponse<void>> {
    console.log(`Deleting employee with ID: ${id}`);
    return this.http.delete<ServiceResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        if (response.success) {
          this.employeesRefresh.next();
        }
      })
    );
  }

  updateEmployee(
    id: number,
    updates: Partial<Employee>
  ): Observable<ServiceResponse<Employee>> {
    console.log('Updating employee:', { id, updates });
    return this.http
      .patch<ServiceResponse<Employee>>(`${this.apiUrl}/${id}`, updates)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.employeesRefresh.next();
          }
        })
      );
  }

  addEmployee(
    employee: Partial<Employee>
  ): Observable<ServiceResponse<Employee>> {
    console.log('Adding new employee:', employee);
    return this.http
      .post<ServiceResponse<Employee>>(this.apiUrl, employee)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.employeesRefresh.next();
          }
        })
      );
  }

  getEmployee(id: number): Observable<Employee> {
    console.log('Fetching single employee:', id);
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      tap((employee) => {
        console.log('Employee received:', employee);
      })
    );
  }

  refreshEmployees() {
    this.refreshRequired.next();
  }
}
