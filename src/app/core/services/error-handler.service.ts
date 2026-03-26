import { Injectable } from '@angular/core';

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'validation' | 'business-logic' | 'network' | 'server' | 'unauthorized' | 'not-found';
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /**
   * Analyse une erreur HTTP et retourne un message spécifique et clair
   */
  handleError(error: any): ErrorMessage {
    // Erreur de réseau/non réponse du serveur
    if (!error.status || error.status === 0) {
      return this.createErrorMessage(
        'Erreur réseau',
        'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.',
        'network'
      );
    }

    // Erreur 401 - Non authentifié
    if (error.status === 401) {
      return this.createErrorMessage(
        'Accès refusé',
        'Votre session a expiré. Veuillez vous reconnecter.',
        'unauthorized'
      );
    }

    // Erreur 403 - Accès interdit
    if (error.status === 403) {
      return this.createErrorMessage(
        'Permission refusée',
        'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
        'unauthorized'
      );
    }

    // Erreur 404 - Non trouvé
    if (error.status === 404) {
      const resource = error.error?.resource || 'la ressource';
      return this.createErrorMessage(
        'Non trouvé',
        `${resource} n'existe pas ou a été supprimé.`,
        'not-found'
      );
    }

    // Erreur 400 - Validation
    if (error.status === 400) {
      const message = error.error?.message || error.error?.detail || 'Données invalides envoyées.';
      return this.createErrorMessage(
        'Erreur de validation',
        this.formatValidationError(message),
        'validation'
      );
    }

    // Erreur 409 - Conflit (business logic)
    if (error.status === 409) {
      const message = error.error?.message || 'Un conflit a été détecté.';
      return this.createErrorMessage(
        'Opération impossible',
        message,
        'business-logic'
      );
    }

    // Erreur 422 - Unprocessable Entity (validation métier)
    if (error.status === 422) {
      const message = error.error?.message || error.error?.detail || 'Les données ne respectent pas les règles métier.';
      return this.createErrorMessage(
        'Erreur métier',
        this.formatValidationError(message),
        'business-logic'
      );
    }

    // Erreur 500 - Serveur interne
    if (error.status === 500) {
      return this.createErrorMessage(
        'Erreur serveur',
        'Une erreur interne s\'est produite. Veuillez rééssayer plus tard.',
        'server'
      );
    }

    // Erreur 503 - Service indisponible
    if (error.status === 503) {
      return this.createErrorMessage(
        'Service indisponible',
        'Le serveur est actuellement en maintenance. Réessayez plus tard.',
        'server'
      );
    }

    // Message d'erreur personnalisé du serveur
    if (error.error?.message) {
      return this.createErrorMessage(
        'Erreur',
        error.error.message,
        this.inferErrorType(error.error.message)
      );
    }

    // Erreur générique
    return this.createErrorMessage(
      'Erreur inconnue',
      'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      'server'
    );
  }

  /**
   * Valide un formulaire et retourne un message d'erreur si invalide
   */
  validateForm(validationFn: () => boolean, fieldName: string): ErrorMessage | null {
    if (!validationFn()) {
      return this.createErrorMessage(
        'Validation échouée',
        `Le champ "${fieldName}" est invalide ou vide.`,
        'validation'
      );
    }
    return null;
  }

  /**
   * Valide une date et retourne un message spécifique
   */
  validateDateRange(startDate: string, endDate: string): ErrorMessage | null {
    if (!startDate || !endDate) {
      return this.createErrorMessage(
        'Dates manquantes',
        'Veuillez spécifier une date de départ et une date de retour.',
        'validation'
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return this.createErrorMessage(
        'Plage de dates invalide',
        'La date de retour doit être postérieure à la date de départ.',
        'validation'
      );
    }

    return null;
  }

  /**
   * Valide un montant financier
   */
  validateAmount(amount: number | string, fieldName: string = 'montant'): ErrorMessage | null {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount) || numAmount <= 0) {
      return this.createErrorMessage(
        'Montant invalide',
        `Le ${fieldName} doit être un nombre positif.`,
        'validation'
      );
    }

    return null;
  }

  /**
   * Valide une email
   */
  validateEmail(email: string): ErrorMessage | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return this.createErrorMessage(
        'Email invalide',
        'Veuillez entrer une adresse email valide (exemple: user@example.com).',
        'validation'
      );
    }
    return null;
  }

  /**
   * Valide une longueur de texte
   */
  validateTextLength(text: string, minLength: number = 3, maxLength: number = 255, fieldName: string = 'texte'): ErrorMessage | null {
    if (!text || text.trim().length < minLength) {
      return this.createErrorMessage(
        `${fieldName} trop court`,
        `Le ${fieldName} doit contenir au moins ${minLength} caractères.`,
        'validation'
      );
    }

    if (text.length > maxLength) {
      return this.createErrorMessage(
        `${fieldName} trop long`,
        `Le ${fieldName} ne doit pas dépasser ${maxLength} caractères.`,
        'validation'
      );
    }

    return null;
  }

  /**
   * Valide un fichier (type et taille)
   */
  validateFile(file: File, allowedTypes: string[], maxSizeMB: number = 5): ErrorMessage | null {
    if (!file) {
      return this.createErrorMessage(
        'Fichier manquant',
        'Veuillez sélectionner un fichier.',
        'validation'
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return this.createErrorMessage(
        'Type de fichier non autorisé',
        `Seuls les formats suivants sont acceptés: ${allowedTypes.join(', ')}`,
        'validation'
      );
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return this.createErrorMessage(
        'Fichier trop volumineux',
        `La taille du fichier ne doit pas dépasser ${maxSizeMB}MB (fichier actuel: ${sizeMB.toFixed(2)}MB).`,
        'validation'
      );
    }

    return null;
  }

  /**
   * Crée une instance de ErrorMessage
   */
  private createErrorMessage(title: string, message: string, type: ErrorMessage['type']): ErrorMessage {
    return { title, message, type };
  }

  /**
   * Formate le message d'erreur de validation
   */
  private formatValidationError(message: string): string {
    // Si c'est déjà un message lisible, le retourner
    if (message && message.length > 0) {
      return message.charAt(0).toUpperCase() + message.slice(1);
    }
    return 'Veuillez vérifier les données soumises.';
  }

  /**
   * Déduit le type d'erreur en fonction du message
   */
  private inferErrorType(message: string): ErrorMessage['type'] {
    if (!message) return 'server';

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('validation') || lowerMsg.includes('invalide') || lowerMsg.includes('requis')) {
      return 'validation';
    }
    if (lowerMsg.includes('existe déjà') || lowerMsg.includes('conflit') || lowerMsg.includes('impossible')) {
      return 'business-logic';
    }
    if (lowerMsg.includes('non trouvé') || lowerMsg.includes('n\'existe pas')) {
      return 'not-found';
    }
    if (lowerMsg.includes('permission') || lowerMsg.includes('refusé')) {
      return 'unauthorized';
    }

    return 'server';
  }

  /**
   * Retourne un message utilisateur approprié pour chaque type d'erreur
   */
  getUserFriendlyMessage(error: ErrorMessage): string {
    return `${error.title}: ${error.message}`;
  }
}
