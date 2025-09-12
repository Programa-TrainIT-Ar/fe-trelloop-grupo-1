export type NotificationType =
  | "BOARD_MEMBER_ADDED"
  | "CARD_ASSIGNED"
  | "COMMENT_NEW"
  | "COMMENT_REPLY";


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