export type NotificationType = "BOARD_MEMBER_ADDED" | "CARD_ASSIGNED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  resource?: { kind: "board" | "card"; id: string };
  actorId?: string;
  read?: boolean;
  createdAt?: string;
  metadata?: Record<string, any>;
}