export interface Notification {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  dateCreation?: string;
  type?: string;
}