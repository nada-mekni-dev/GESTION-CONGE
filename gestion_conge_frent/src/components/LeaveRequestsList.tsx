import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, FileText, Download, Mail } from 'lucide-react';
import { generateLeavePDF } from '@/utils/pdfGenerator';

const LeaveRequestsList = () => {
  const { user } = useAuth();
  const { requests, updateRequestStatus ,deleteRequest} = useLeave();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [managerComment, setManagerComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) return null;

  const displayRequests = user.role === 'manager' 
    ? requests 
    : requests.filter(req => req.employee_id === user.id);

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected', managerComments: string) => {
    setIsProcessing(true);
    
    try {

      const request = requests.find(r => r.id === requestId);
    if (!request) throw new Error('Demande introuvable');
    
      await updateRequestStatus(requestId, status, managerComments);
      toast({
        title: status === 'approved' ? "Demande approuvée" : "Demande rejetée",
        description: status === 'approved' 
          ? "Le statut a été mis à jour et un email de notification a été envoyé."
          : "Le statut a été mis à jour avec succès.",
        action: status === 'approved' ? (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Mail className="h-4 w-4" />
            Email envoyé
          </div>
        ) : undefined,
      });
      setManagerComment('');
    } catch (error :any) {
      console.error('Erreur handleStatusUpdate:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du statut.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = (request: any) => {
    try {
      generateLeavePDF(request);
      toast({
        title: "PDF téléchargé",
        description: "L'attestation de congé a été téléchargée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du téléchargement du PDF.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="status-badge status-pending">En attente</Badge>;
      case 'approved':
        return <Badge className="status-badge status-approved">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="status-badge status-rejected">Rejetée</Badge>;
      default:
        return null;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual: 'Congés Annuels',
      sick: 'Congé Maladie',
      personal: 'Congé Personnel',
      maternity: 'Congé Maternité',
      paternity: 'Congé Paternité'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Date invalide";
  }
  return date.toISOString().slice(0, 10);
};

const handleDeleteRequest = async (id: string) => {
  try {
    await deleteRequest(id);
    toast({
      title: "Demande supprimée",
      description: "La demande a été supprimée avec succès.",
    });
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.message || "Impossible de supprimer la demande.",
      variant: "destructive",
    });
  }
};




  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold">
            {user.role === 'manager' ? 'Gestion des Demandes' : 'Mes Demandes'}
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'manager' 
              ? 'Gérez les demandes de congés de votre équipe' 
              : 'Suivez le statut de vos demandes de congés'
            }
          </p>
        </div>
      </div>

      {displayRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune demande</h3>
            <p className="text-muted-foreground">
              {user.role === 'manager' 
                ? 'Aucune demande de congé à traiter pour le moment.' 
                : 'Vous n\'avez soumis aucune demande de congé.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {displayRequests.map((request) => (
            <div key={request.id}>
              <Card key={request.employee_id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.employee_name}</CardTitle>
                      <CardDescription>
                        {getLeaveTypeLabel(request.leave_type)} • {request.days} jour(s)
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground">Période</div>
                        <div>{formatDate(request.start_date)} au {formatDate(request.end_date)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Date de demande</div>
                        <div>{formatDate(request.applied_date)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Durée</div>
                        <div>{request.days} jour{request.days > 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-muted-foreground text-sm mb-1">Motif</div>
                      <div className="text-sm">{request.reason}</div>
                    </div>

                    {request.status !== 'pending' && request.manager_comment && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="font-medium text-muted-foreground text-sm mb-1">
                          Commentaire du manager
                        </div>
                        <div className="text-sm">{request.manager_comment}</div>
                      </div>
                    )}

                    {request.status === 'pending' && user.role === 'manager' && (
                      <div className="bg-muted p-4 rounded-lg mt-4 space-y-2">
                          <div className="font-medium text-muted-foreground text-sm">
                            Ajouter un commentaire
                          </div>
                          <textarea
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Écrire un commentaire..."
                            value={managerComment}
                            onChange={(e) => setManagerComment(e.target.value)}
                          />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white text-black">
                          <DialogHeader>
                            <DialogTitle>Détails de la demande</DialogTitle>
                            <DialogDescription>
                              Demande de {selectedRequest?.employee_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-medium">Type de congé</Label>
                                  <p>{getLeaveTypeLabel(selectedRequest.leave_type)}</p>
                                </div>
                                <div>
                                  <Label className="font-medium">Statut</Label>
                                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-medium">Date de début</Label>
                                  <p>{formatDate(selectedRequest.start_date)}</p>
                                </div>
                                <div>
                                  <Label className="font-medium">Date de fin</Label>
                                  <p>{formatDate(selectedRequest.end_date)}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="font-medium">Motif</Label>
                                <p className="mt-1">{selectedRequest.reason}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Bouton de téléchargement PDF pour les congés approuvés */}
                      {request.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadPDF(request)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger PDF
                        </Button>
                      )}

                      {user.role === 'manager' && request.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusUpdate(request.id, 'approved' , managerComment)}
                            className="bg-secondary hover:bg-secondary/90"
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isProcessing ? 'Traitement...' : 'Approuver'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleStatusUpdate(request.id, 'rejected', managerComment)}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                          
                        </>
                      )}

                      {request.status === 'pending' && (
                        (user.role === 'employee' && request.employee_id === user.id) || 
                        (user.role === 'manager' && request.employee_id === user.id)) && 
                        (<Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    )}

                      
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <div className={`text-sm font-medium text-muted-foreground ${className}`} {...props}>
    {children}
  </div>
);

export default LeaveRequestsList;
