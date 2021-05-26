import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StorageService {
  private storageSub: Subject<boolean> = new Subject<boolean>();

  public watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  public getItem(key: string): any {
    return localStorage.getItem(key);
  }

  public setItem(key: string, data: any): void {
    localStorage.setItem(key, data);
    this.storageSub.next();
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
    this.storageSub.next();
  }

  public clear(): void {
    localStorage.clear();
    this.storageSub.next();
  }
}
