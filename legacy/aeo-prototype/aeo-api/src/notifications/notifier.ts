import type { AlertRecord } from "../domain/types.js";

export interface NotificationService {
  notifyAlert(alert: AlertRecord): Promise<void>;
}

export class ConsoleEmailNotifier implements NotificationService {
  async notifyAlert(alert: AlertRecord): Promise<void> {
    console.info(
      `[ALERT][email-stub] site=${alert.siteId} rule=${alert.rule} message="${alert.message}"`,
    );
  }
}
