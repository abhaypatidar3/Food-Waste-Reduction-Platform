import { notificationAPI } from './api';

export const getNotifications = () => notificationAPI.getAll();
export const markAsRead = (id) => notificationAPI.markAsRead(id);
export const markAllAsRead = () => notificationAPI. markAllAsRead();