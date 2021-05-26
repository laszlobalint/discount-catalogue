import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../service/alert.service';
import { Alert, AlertType } from '../model/alert.model';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.html',
  styles: [
    `
      #alert-message {
        text-align: center;
        align-content: center;
      }
    `,
  ],
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() public id: string;
  public alerts: Alert[] = [];
  public subscription: Subscription;

  constructor(private readonly alertService: AlertService) {}

  public ngOnInit(): void {
    this.subscription = this.alertService.onAlert(this.id).subscribe((alert) => {
      if (!alert.message) {
        this.alerts = [];
        return;
      }
      this.alerts.push(alert);
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public removeAlert(alert: Alert): void {
    this.alerts = this.alerts.filter((x) => x !== alert);
  }

  public cssClass(alert: Alert): string {
    if (!alert) {
      return;
    }
    switch (alert.type) {
      case AlertType.Success:
        return 'alert alert-success';
      case AlertType.Error:
        return 'alert alert-danger';
      case AlertType.Info:
        return 'alert alert-info';
      case AlertType.Warning:
        return 'alert alert-warning';
    }
  }
}
