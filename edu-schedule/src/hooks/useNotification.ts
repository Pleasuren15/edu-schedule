import { useNotificationStore } from '../store';

export function useNotification() {
  const { message, type, show, clear } = useNotificationStore();

  return { message, type, show, clear };
}
