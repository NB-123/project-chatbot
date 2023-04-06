export type ChatMessage = {
  id: string;
  message: string;
  isBot: boolean;
  avatar?: string;
  timestamp: string;
};

export type ChatData = {
  chatId: string;
  chatMessages: ChatMessage[];
};
