
import jsPDF from 'jspdf';
import { LeaveRequest } from '@/types';

export const generateLeavePDF = (request: LeaveRequest) => {
  const doc = new jsPDF();
  
  // En-tête du document
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTESTATION DE CONGÉ APPROUVÉ', 20, 30);
  
  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Informations de l'employé
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('INFORMATIONS DE L\'EMPLOYÉ', 20, 50);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nom:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(String(request.employee_name), 50, 65);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ID Employé:', 20, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(String(request.employee_id), 50, 75);
  
  // Détails du congé
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DU CONGÉ', 20, 95);
  
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
  
  doc.setFont('helvetica', 'bold');
  doc.text('Type de congé:', 20, 110);
  doc.setFont('helvetica', 'normal');
  doc.text(getLeaveTypeLabel(request.leave_type), 70, 110);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date de début:', 20, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(request.start_date).toLocaleDateString('fr-FR'), 70, 120);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date de fin:', 20, 130);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(request.end_date).toLocaleDateString('fr-FR'), 70, 130);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Durée:', 20, 140);
  doc.setFont('helvetica', 'normal');
  doc.text(`${request.days} jour${request.days > 1 ? 's' : ''}`, 70, 140);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Statut:', 20, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('APPROUVÉ', 70, 150);
  
  // Motif
  doc.setFont('helvetica', 'bold');
  doc.text('Motif:', 20, 165);
  doc.setFont('helvetica', 'normal');
  
  // Gérer le texte long pour le motif
  const reasonLines = doc.splitTextToSize(request.reason, 150);
  doc.text(reasonLines, 20, 175);
  
  // Commentaire du manager (si présent)
  if (request.manager_comment) {
    const yPos = 175 + (reasonLines.length * 10) + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Commentaire du manager:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const commentLines = doc.splitTextToSize(request.manager_comment, 150);
    doc.text(commentLines, 20, yPos + 10);
  }
  
  // Informations de validation
  const finalYPos = 220;
  doc.setFont('helvetica', 'bold');
  doc.text('VALIDATION', 20, finalYPos);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date de demande: ${new Date(request.applied_date).toLocaleDateString('fr-FR')}`, 20, finalYPos + 15);
  doc.text(`Document généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, finalYPos + 25);
  
  // Pied de page
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce document certifie l\'approbation de la demande de congé ci-dessus.', 20, 280);
  
  // Télécharger le PDF
  const fileName = `conge_${request.employee_name.replace(/\s+/g, '_')}_${new Date(request.start_date).toLocaleDateString('fr-FR')}.pdf`;
  doc.save(fileName);
};
