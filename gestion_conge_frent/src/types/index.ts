
export interface User {
  password: string;
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  department: string;
  leave_annual: number;
  leave_sick: number;
  leave_personal: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_mail: string;
  employee_name: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  manager_id?: string;
  manager_comment?: string;
  days: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
