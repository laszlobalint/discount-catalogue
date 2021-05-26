export class Alert {
  type: AlertType;
  message: string;
  alertId: string;
  keepAfterRouteChange: boolean;

  constructor(public readonly init?: Partial<Alert>) {
    Object.assign(this, init);
  }
}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning,
}
