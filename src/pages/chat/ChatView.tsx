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
import React, { useEffect, useState } from 'react';
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
  const [messageApi, contextHolder] = message.useMessage();
  const fetchChatMessages = async () => {
    try {
      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/chats'
      );
      if (response.ok) {
        const fetchedChats = await response.json();
        const messages = fetchedChats['1'].messages as ChatMessage[]; // Assuming chatId 1 is the target
        setChatMessages(messages);
      } else {
        throw new Error('Fetching chats failed');
      }
    } catch (error) {
      message.error(`Error fetching chats: ${error}`);
    }
  };
  useEffect(() => {
    fetchChatMessages();
  }, []);
  const handleSendMessage = async () => {
    const newMessage = {
      id: uuidv4(),
      message: inputValue,
      isBot: false,
      avatar: '',
      timestamp: new Date().toISOString(),
    };
    message.loading('AI is thinking, this might take a while...');
    setInputValue('');
    setChatMessages([...chatMessages, newMessage]);
    try {
      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/query',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage.message,
            chatId: '03d12409-f44e-4a5a-ac28-dee7f55082c8',
          }),
        }
      );

      if (response.status === 200) {
        await fetch(`/api/chat/1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([newMessage]),
        });
        const data = await response.json();
        const incomingMessage = {
          id: uuidv4(),
          message: data.message,
          isBot: false,
          avatar: '',
          timestamp: new Date().toISOString(),
        };
        setChatMessages([...chatMessages, incomingMessage]);
      } else {
        throw new Error('Error sending message');
      }
    } catch (error) {
      message.error(`Error sending message: ${error}`);
    }
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
