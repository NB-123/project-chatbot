import {
  List,
  Avatar,
  Input,
  Button,
  message,
  Card,
  Upload,
  Typography,
  Progress,
  Modal,
} from 'antd';
import React, { useState } from 'react';
import { ChatMessage } from '../../../types/chat';
const { Text } = Typography;
const { TextArea } = Input;
import { v4 as uuidv4 } from 'uuid';

const ChatInput = ({ value, onChange, onSend }: any) => {
  return (
    <div className="flex flex-row">
      <TextArea
        rows={2}
        placeholder="Type your message here"
        value={value}
        onChange={onChange}
        className="mr-2"
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <Button type="primary" onClick={onSend}>
        Send
      </Button>
    </div>
  );
};

const ChatListItem = ({ message, isBot, avatar, timestamp }: ChatMessage) => {
  const messageClass = `p-2 rounded-lg ${
    isBot ? 'bg-gray-100' : 'bg-blue-200 self-end'
  }`;
  const avatarComponent = avatar ? (
    <Avatar src={avatar} className="mr-2" />
  ) : null;
  const messageComponent = <Text>{message}</Text>;
  const timestampComponent = (
    <Text type="secondary" className="text-xs ml-3 mt-3">
      {new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Text>
  );
  return (
    <div className="flex flex-row mb-2">
      <div
        className={messageClass}
        style={{
          marginLeft: isBot ? '0' : 'auto',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: isBot ? '10px' : '0',
          borderTopRightRadius: '10px',
          borderTopLeftRadius: isBot ? '0' : '10px',
          paddingBottom: '10px',
          position: 'relative',
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center">
            {isBot ? avatarComponent : null}
            {messageComponent}
            {timestampComponent}
          </div>
        </div>
      </div>
      {!isBot ? avatarComponent : null}
    </div>
  );
};
type ChatProps = {
  chatMessages: ChatMessage[];
  setChatMessages: (chatMessages: ChatMessage[]) => void;
};
function ChatView({ chatMessages, setChatMessages }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const handleSendMessage = () => {
    setChatMessages([
      ...chatMessages,
      {
        id: uuidv4(),
        message: inputValue,
        isBot: false,
        avatar: '',
        timestamp: new Date().toISOString(),
      },
    ]);
    setInputValue('');
  };

  return (
    <div>
      <Card title="Chat" className="rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {chatMessages.map((chatMessage, index) => (
              <ChatListItem key={index} {...chatMessage} />
            ))}
          </div>
          <div className="mt-4">
            <ChatInput
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ChatView;
