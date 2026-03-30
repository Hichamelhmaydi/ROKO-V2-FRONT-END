import { Activite } from './voyage.model';

export type ReservationStatus =
  | 'EN_ATTENTE'
  | 'PAYEE'
  | 'ANNULEE'
  | string;

export interface Reservation {
  id: number;
  voyageId: number;
  userId?: number;
  voyageNom?: string;
  voyageDestination?: string;
  voyageDateDepart?: string;
  voyageDateRetour?: string;
  userNom?: string;
  userPrenom?: string;
  userEmail?: string;
  nombrePersonnes: number;
  statut?: ReservationStatus;
  dateReservation?: string;
  dateConfirmation?: string;
  dateAnnulation?: string;
  dateCompletion?: string;
  prixBase?: number;
  prixActivites?: number;
  montantTotal?: number;
  commentaire?: string;
  activitesOptionnellesIds?: number[];
  activites?: Activite[];
  motifAnnulation?: string;
  paiementEffectue?: boolean;
  datePaiement?: string;
}

export interface ReservationRequest {
  voyageId: number;
  nombrePersonnes: number;
  commentaire?: string;
  activitesOptionnellesIds?: number[];
}