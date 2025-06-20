
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { requests } = useLeave();

  if (!user) return null;

  const userRequests = Array.isArray(requests)
  ? requests.filter(req => req.employee_id === user.id)
  : [];

 const pendingRequests = user.role === 'manager'
  ? (Array.isArray(requests) ? requests.filter(req => req.status === 'pending') : [])
  : userRequests.filter(req => req.status === 'pending');


  const approvedRequests = userRequests.filter(req => req.status === 'approved');
  const totalLeaveDays = (user.leave_annual ?? 0) + (user.leave_sick ?? 0) + (user.leave_personal ?? 0);


  const stats = [
    {
      title: "Solde Total",
      value: totalLeaveDays,
      subtitle: "jours disponibles",
      icon: Calendar,
      color: "text-primary-600"
    },
    {
      title: "Demandes en Attente",
      value: pendingRequests.length,
      subtitle: user.role === 'manager' ? "à traiter" : "en cours",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Congés Approuvés",
      value: approvedRequests.length,
      subtitle: "cette année",
      icon: CheckCircle,
      color: "text-secondary-600"
    },
    {
      title: "Jours Utilisés",
      value: approvedRequests.reduce((sum, req) => sum + req.days, 0),
      subtitle: "jours pris",
      icon: User,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'manager' ? 'Manager' : 'Employé'} - {user.department}
          </p>
        </div>
        <Badge variant="outline" className="text-primary-700 border-primary-200">
          {user.role === 'manager' ? 'Gestionnaire' : 'Employé'}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave Balance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Détail du Solde de Congés</CardTitle>
          <CardDescription>Répartition de vos jours de congés disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-700">{user.leave_annual}</div>
              <div className="text-sm text-primary-600">Congés Annuels</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-700">{user.leave_sick}</div>
              <div className="text-sm text-secondary-600">Congés Maladie</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{user.leave_personal}</div>
              <div className="text-sm text-purple-600">Congés Personnels</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            {user.role === 'manager' 
              ? 'Demandes nécessitant votre attention' 
              : 'Vos dernières demandes de congés'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {user.role === 'manager' 
                ? 'Aucune demande en attente' 
                : 'Aucune demande en cours'
              }
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{request.employee_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.leave_type} - {new Date(request.start_date).toLocaleDateString('fr-FR')} au {new Date(request.end_date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <Badge className="status-badge status-pending">
                    En attente
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
