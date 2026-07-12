let notificationsProvider = {
  send: () => { throw new Error('Notifications Provider no registrado'); }
};

export const registerNotificationsProvider = (providerImpl) => {
  notificationsProvider = providerImpl;
};

export const Notifications = {
  send(recipientId, type, title, body, metadata = {}) {
    return notificationsProvider.send(recipientId, type, title, body, metadata);
  }
};
