import { createCentralNotification } from '../../services/notificationCenterService';

export const firebaseNotificationsProvider = {
  /**
   * Crea y despacha una notificación central.
   */
  async send(recipientId, type, title, body, metadata = {}) {
    return createCentralNotification({
      recipientId,
      recipientRole: metadata.recipientRole || 'client',
      type,
      title,
      body,
      soundCategory: metadata.soundCategory || 'alerta',
      clickAction: metadata.clickAction || '/',
      orderId: metadata.orderId || null,
      orderNumber: metadata.orderNumber || null
    });
  }
};
