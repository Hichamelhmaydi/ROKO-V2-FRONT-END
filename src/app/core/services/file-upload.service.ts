import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  filename: string;
  url: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getFileUrl(filename: string): string {
    return `${environment.apiUrl}/files/${filename}`;
  }

  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${filename}`);
  }
}
