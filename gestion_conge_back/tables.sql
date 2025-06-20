CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255), -- si tu fais une authentification
  role ENUM('employee', 'manager') NOT NULL,
  department VARCHAR(100),
  annual_leave INT DEFAULT 25,
  sick_leave INT DEFAULT 10,
  personal_leave INT DEFAULT 5
);

CREATE TABLE leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  leave_type ENUM('annual', 'sick', 'personal', 'maternity', 'paternity') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  applied_date DATE NOT NULL,
  manager_id INT,
  manager_comment TEXT,
  days INT,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (manager_id) REFERENCES users(id)
);
