import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Eye, CheckCircle, XCircle, FileText, Download, Mail, Users } from 'lucide-react';
import { useEmployee } from '@/contexts/EmployeeProvider';

const ListAddEmp = () => {
  const { employees, getEmployeeById } = useEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { addEmployee } = useEmployee();

    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    leave_annual: 0,
    leave_sick: 0,
    leave_personal: 0
  });

  const handleAddEmployee = async () => {
    const { name, email, department, leave_annual, leave_sick, leave_personal } = form;

    if (!name || !email || !department) {
        toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires.",
                variant: "destructive",
              });
      return;
    }

    if (!isValidEmail(email)) {
        toast({
            title: "Erreur",
            description: "Veuillez saisir une adresse email valide.",
            variant: "destructive",
        });
        return;
    }

    try {
      await addEmployee({
        name,
        email,
        department,
        leave_annual,
        leave_sick,
        leave_personal
      });

      // Réinitialiser le formulaire
      setForm({
        name: '',
        email: '',
        department: '',
        leave_annual: 0,
        leave_sick: 0,
        leave_personal: 0,
      });

      // Fermer la modale
      setOpenAddDialog(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  const handleClick = async (id: number) => {
    const employee = await getEmployeeById(id);
    if (employee) {  
        setSelectedEmployee(employee);
      //alert(`Nom: ${employee.name}\nEmail: ${employee.email}\nDépartement: ${employee.department}`);
    }
  };

return (
  <div className=" p-6 space-y-8">
    {/* En-tête avec bouton d'ajout */}
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold">Liste des employés</h1>
              <p className="text-muted-foreground">Détails des employés</p>
            </div>
      </div>
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogTrigger asChild>
          <Button  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow">
            Ajouter un employé
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-white text-black rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Ajouter un nouvel employé</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Département</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Congé annuel</Label>
                <Input type="number" value={form.leave_annual} onChange={(e) => setForm({ ...form, leave_annual: +e.target.value })} />
              </div>
              <div>
                <Label>Congé maladie</Label>
                <Input type="number" value={form.leave_sick} onChange={(e) => setForm({ ...form, leave_sick: +e.target.value })} />
              </div>
              <div>
                <Label>Congé personnel</Label>
                <Input type="number" value={form.leave_personal} onChange={(e) => setForm({ ...form, leave_personal: +e.target.value })} />
              </div>
            </div>
            <Button onClick={handleAddEmployee} className="mt-4 w-full hover:bg-green-700 text-white">
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Liste des employés */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((emp) => (
        <Card key={emp.id} className="shadow-md border border-gray-200 rounded-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
            
            <div className="text-lg font-bold text-gray-800">{emp.name}</div>
            </div>
            <div className="text-sm text-gray-500">{emp.email}</div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleClick(emp.id)}>
                  Voir détails
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white text-black rounded-xl">
                {selectedEmployee?.id === emp.id && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Détails de l'employé</DialogTitle>
                      <DialogDescription>
                        Informations de {selectedEmployee.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <p className="text-gray-700">{selectedEmployee.email}</p>
                        </div>
                        <div>
                          <Label>Département</Label>
                          <p className="text-gray-700">{selectedEmployee.department}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Congés annuels</Label>
                          <p className="text-gray-700">{selectedEmployee.leave_annual}</p>
                        </div>
                        <div>
                          <Label>Congés personnels</Label>
                          <p className="text-gray-700">{selectedEmployee.leave_personal}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Congés maladie</Label>
                        <p className="text-gray-700">{selectedEmployee.leave_sick}</p>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);


  /*
  return(
  <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Liste des employés</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>Ajouter un employé</Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl bg-white text-black'>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel employé</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Label>Département</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <Label>Congé annuel</Label>
              <Input type="number" value={form.leave_annual} onChange={(e) => setForm({ ...form, leave_annual: +e.target.value })} />
              <Label>Congé maladie</Label>
              <Input type="number" value={form.leave_sick} onChange={(e) => setForm({ ...form, leave_sick: +e.target.value })} />
              <Label>Congé personnel</Label>
              <Input type="number" value={form.leave_personal} onChange={(e) => setForm({ ...form, leave_personal: +e.target.value })} />
              <Button onClick={handleAddEmployee}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <Card key={emp.id}>
            <CardContent className="p-4 space-y-2">
              <div className="font-semibold">{emp.name}</div>
              <div className="text-sm text-gray-500">{emp.email}</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => handleClick(emp.id)}>
                    Voir détails
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white text-black">
                  {selectedEmployee?.id === emp.id && (
                            <>
                                <DialogHeader>
                                  <DialogTitle>Détails de l'employee</DialogTitle>
                                  <DialogDescription>
                                    Détails de {selectedEmployee.name}
                                  </DialogDescription>
                                </DialogHeader>
                                {emp && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-medium">Email</Label>
                                        <p>{selectedEmployee.email}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Department</Label>
                                        <div className="mt-1">{selectedEmployee.department}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-medium">Congés Annuels</Label>
                                        <p>{selectedEmployee.leave_annual}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Congés Personnels</Label>
                                        <p>{selectedEmployee.leave_personal}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-medium">Congés Maladie</Label>
                                      <p className="mt-1">{selectedEmployee.leave_sick}</p>
                                    </div>
                                  </div>
                                )}
                            </>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    );*/
};

export default ListAddEmp;
