export interface Leave {
  id: number;
  employeeId: number;
  type: string;
  startDate: Date;
  duration: number;
}

export interface LeaveForm {
  employeeId: number;
  type: string;
  startDate: Date;
  duration: number;
}
