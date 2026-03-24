export interface Voyage {
  id: number;
  nom: string;
  description: string;
  destination: string;
  dateDepart: string;
  dateRetour: string;
  prixInitial: number;
  prixBase: number;
  cover?: string;
  statut: string;
  itineraire?: string;
  photos?: string[];
  activites?: Activite[];
}

export interface VoyageRequest {
  nom: string;
  description: string;
  destination: string;
  dateDepart: string;
  dateRetour: string;
  prixInitial?: number;
  prixBase: number;
  cover?: string;
  photos?: string[];
  itineraire?: string;
}

export interface Activite {
  id: number;
  nom: string;
  description: string;
  prix: number;
  voyageId: number;
  voyageNom?: string;
  nombreReservations?: number;
  duree?: number;
}

export interface ActiviteRequest {
  nom: string;
  description: string;
  prix: number;
  voyageId: number;
}

export interface ActiviteVoyage {
  id: number;
  activiteId: number;
  voyageId: number;
  activiteNom?: string;
  activiteDescription?: string;
  voyageNom?: string;
  voyageDestination?: string;
  prix?: number;
  obligatoire?: boolean;
  ordreAffichage?: number;
  jourPrevu?: string;
  dureeMinutes?: number;
  notes?: string;
  disponible?: boolean;
}
