export interface Employee {
  id: number;
  name: string;
  dateOfBirth: string;
  qualification: string;
  leaves: Leave[];
  totalLeaveDays: number;
}

export interface EmployeeForm {
  name: string;
  dateOfBirth: string;
  qualification: string;
}

export interface Leave {
  id?: number;
  employeeId: number;
  startDate: string;
  duration: number;
  leaveType: string;
  status: string;
  employee?: Employee;
}

export interface EmployeeApiResponse {
  data: Employee[];
  totalItems: number;
  pageSize: number;
  currentPage: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
