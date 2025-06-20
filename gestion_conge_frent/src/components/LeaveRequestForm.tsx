import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

const LeaveRequestForm = () => {
  const { user } = useAuth();
  const { addRequest} = useLeave();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = [
    { value: 'annual', label: 'Congés Annuels' },
    { value: 'sick', label: 'Congé Maladie' },
    { value: 'personal', label: 'Congé Personnel' },
    { value: 'maternity', label: 'Congé Maternité' },
    { value: 'paternity', label: 'Congé Paternité' }
  ];

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const days = calculateDays(formData.startDate, formData.endDate);
    try {
      await addRequest({
        employee_id: user.id,
        employee_name: user.name,
        employee_mail: user.email,
        leave_type: formData.leaveType as any,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        days,
        applied_date: ''
      });

      toast({
        title: "Demande soumise",
        description: `Votre demande de ${days} jour(s) a été envoyée avec succès.`,
      });

      // Reset form
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission",
        variant: "destructive",
      });
    }
  };

  const days = calculateDays(formData.startDate, formData.endDate);



  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Demande de Congé</h1>
          <p className="text-muted-foreground">Remplissez le formulaire ci-dessous</p>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Détails de la Demande</CardTitle>
          <CardDescription>
            Toutes les informations sont requises pour traiter votre demande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Type de Congé</Label>
                <Select value={formData.leaveType} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, leaveType: value }))
                }>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durée</Label>
                <div className="text-2xl font-bold text-primary-600 bg-primary-50 rounded-lg p-3 text-center">
                  {days} jour{days > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de Début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  className="h-11"
                  min={new Date().toISOString().split('T')[0]}
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  className="h-11"
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motif de la Demande</Label>
              <Textarea
                id="reason"
                placeholder="Décrivez brièvement le motif de votre demande..."
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                required
                className="min-h-[100px] resize-none"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base font-medium"
                disabled={!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason }
              >
                Soumettre la Demande
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12"
                onClick={() => setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' })}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequestForm;
