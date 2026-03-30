export interface AdminDashboard {
  totalReservations: number;
  reservationsEnAttente: number;
  reservationsEnAttentePaiement: number;
  reservationsPayees: number;
  reservationsAnnulees: number;
  totalVoyages: number;
  voyagesDisponibles: number;
  totalVoyageurs: number;
  voyageursActifs: number;
  voyageursBloques: number;
}