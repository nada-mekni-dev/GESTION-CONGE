import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ProfileEdit = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    leave_annual: 0,
    leave_sick: 0,
    leave_personal: 0,
    password:''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        department: user.department,
        leave_annual: user.leave_annual,
        leave_sick: user.leave_sick,
        leave_personal: user.leave_personal,
        password:user.password,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      const updatedUser = await res.json();
      toast({
              title: "Profil mis à jour !",
              description: ` la mise à jour est faite avec succès`,
            });
      // Optionnel : mettre à jour contexte Auth
      
    } catch (err) {
      toast({
              title: "Erreur",
              description: err.message,
              variant: "destructive",
            });
      //alert('Erreur : ' + err.message);
    }
  };

  if (!user) return <div>Chargement...</div>;

return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold">Modifier votre profil</h1>
          <p className="text-muted-foreground">Remplissez les champs pour mettre à jour vos informations</p>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Tous les champs sont obligatoires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input id="department" name="department" value={form.department} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave_annual">Congés annuels</Label>
                <Input id="leave_annual" name="leave_annual" type="number" value={form.leave_annual} onChange={handleChange} min={0} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave_sick">Congés maladie</Label>
                <Input id="leave_sick" name="leave_sick" type="number" value={form.leave_sick} onChange={handleChange} min={0} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leave_personal">Congés personnels</Label>
                <Input id="leave_personal" name="leave_personal" type="number" value={form.leave_personal} onChange={handleChange} min={0} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" className="h-12 text-base font-medium">
                Enregistrer les modifications
              </Button>
              <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12"
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

export default ProfileEdit;
