import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  leave_annual: number;
  leave_sick: number;
  leave_personal: number;
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  getEmployeeById: (id: number) => Promise<Employee | null>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = () => {
      fetch('http://localhost:5000/api/users/employees')
        .then(res => {
          if (!res.ok) throw new Error('Erreur réseau');
          return res.json();
        })
        .then(data => setEmployees(data))
        .catch(err => console.error('Erreur de chargement des employés :', err));
    };

    fetchEmployees();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchEmployees();
      }
    }, 1000); // Refresh toutes les 1s quand actif

    return () => clearInterval(interval);
  }, []);

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      const res = await fetch('http://localhost:5000/api/users/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });

      if (!res.ok) throw new Error('Erreur lors de l\'ajout');

      const { id } = await res.json();
      setEmployees(prev => [...prev, { ...employee, id }]);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'employé :', err);
    }
  };

  const getEmployeeById = async (id: number): Promise<Employee | null> => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/employees/${id}`);
      if (!res.ok) throw new Error('Employé non trouvé');
      const data = await res.json();
      return data[0]; // car le backend renvoie un tableau
    } catch (err) {
      console.error(`Erreur lors de la récupération de l'employé ${id} :`, err);
      return null;
    }
  };

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, getEmployeeById }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};
