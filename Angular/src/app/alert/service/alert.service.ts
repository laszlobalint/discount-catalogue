import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Alert, AlertType } from '../model/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<Alert>();
  private keepAfterRouteChange = false;

  constructor(private readonly router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.keepAfterRouteChange ? (this.keepAfterRouteChange = false) : this.clear();
      }
    });
  }

  onAlert(alertId?: string): Observable<Alert> {
    return this.subject.asObservable().pipe(filter((x) => x && x.alertId === alertId));
  }

  success(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Success, alertId }));
    setTimeout(() => {
      this.clear(alertId);
    }, 10000);
  }

  error(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Error, alertId }));
    setTimeout(() => {
      this.clear(alertId);
    }, 12000);
  }

  info(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Info, alertId }));
    setTimeout(() => {
      this.clear(alertId);
    }, 12000);
  }

  warn(message: string, alertId?: string): void {
    this.alert(new Alert({ message, type: AlertType.Warning, alertId }));
    setTimeout(() => {
      this.clear(alertId);
    }, 12000);
  }

  alert(alert: Alert): void {
    this.keepAfterRouteChange = alert.keepAfterRouteChange;
    this.subject.next(alert);
  }

  clear(alertId?: string): void {
    this.subject.next(new Alert({ alertId }));
  }
}
