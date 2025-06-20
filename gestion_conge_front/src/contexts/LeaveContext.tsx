import React, { createContext, useContext, useEffect, useState } from 'react';
import { LeaveRequest } from '@/types';

interface LeaveContextType {
  requests: LeaveRequest[];
  addRequest: (request: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => Promise<void>;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected', comment?: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}


const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  // Charger les demandes à partir de l'API 

    useEffect(() => {
        const fetchRequests = () =>{
          fetch('http://localhost:5000/api/leaves/')
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(err => console.error('Erreur chargement demandes :', err));
        };
        fetchRequests();
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchRequests();
        }
      }, 1000); 

      return () => clearInterval(interval); // Nettoyage quand le composant est démonté
    }, []);

  const addRequest = async (request: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    try {
      const res = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) throw new Error('Erreur lors de la création');

      const { id } = await res.json();
      setRequests(prev => [...prev, { ...request, id, status: 'pending', appliedDate: new Date().toISOString().split('T')[0] }]);
    } catch (error) {
      console.error('Erreur addRequest :', error);
    }
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', manager_comment?: string ) => {
    const user = localStorage.getItem('gestion-conge-user');
    const manager_id = JSON.parse(user).id;
    try {
      await fetch(`http://localhost:5000/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, manager_comment, manager_id }),
      });
      console.log("body",manager_id, manager_comment );

      setRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, status, managerComment: manager_comment, managerId: manager_id } : req
        )
      );
    } catch (error) {
      console.error('Erreur updateRequestStatus :', error);
    }
  };

  const deleteRequest = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/leaves/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors de la suppression');
    }

    setRequests(prev => prev.filter(req => req.id !== id));
  } catch (error) {
    console.error('Erreur deleteRequest :', error);
    throw error;
  }
};


  return (
    <LeaveContext.Provider value={{ requests, addRequest, updateRequestStatus ,deleteRequest}}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
