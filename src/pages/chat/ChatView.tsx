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
  Select,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { ChatMessage } from '../../../types/chat';
const { Text } = Typography;
const { TextArea } = Input;
import { v4 as uuidv4 } from 'uuid';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { CustomDocument } from '../../../types/chat/CustomDocument';

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

type ChatProps = {
  chatMessages: ChatMessage[];
  setChatMessages: (chatMessages: ChatMessage[]) => void;
  documentList: CustomDocument[];
};
function ChatView({ chatMessages, setChatMessages, documentList }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [modalVisible, setModalVisible] = useState(false);

  const ChatListItem = ({
    message: chatMessage,
    isBot,
    avatar,
    timestamp,
    isLastBotMessage,
  }: ChatMessage & { isLastBotMessage: boolean }) => {
    const messageClass = `p-2 rounded-lg ${
      isBot ? 'bg-gray-100' : 'bg-blue-200 self-end'
    }`;
    const avatarComponent = avatar ? (
      <Avatar src={avatar} className="mr-2" />
    ) : null;
    const messageComponent = <Text>{chatMessage}</Text>;
    const timestampComponent = (
      <Text type="secondary" className="text-xs ml-3 mt-3">
        {new Date(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    );
    return (
      <div>
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
        {isBot && isLastBotMessage ? (
          <div className="ml-3">
            <Button
              type="text"
              icon={<LikeOutlined />}
              onClick={() => {
                message.success('Thanks for the feedback!');
              }}
              className="text-green-500 mr-2"
              // eslint-disable-next-line react/jsx-no-duplicate-props
            />
            <Button
              type="text"
              color="red"
              className="text-red-500 mr-2"
              icon={<DislikeOutlined />}
              onClick={() => handleThumbsDown()}
            />
          </div>
        ) : null}
      </div>
    );
  };

  // TODO: Fetch chat messages from API
  // const fetchChatMessages = async () => {
  //   try {
  //     const response = await fetch(
  //       'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/chats'
  //     );
  //     if (response.ok) {
  //       const fetchedChats = await response.json();
  //       const messages = fetchedChats['1'].messages as ChatMessage[]; // Assuming chatId 1 is the target
  //       setChatMessages(messages);
  //     } else {
  //       throw new Error('Fetching chats failed');
  //     }
  //   } catch (error) {
  //     message.error(`Error fetching chats: ${error}`);
  //   }
  // };
  // useEffect(() => {
  //   fetchChatMessages();
  // }, []);
  const handleThumbsDown = () => {
    setModalVisible(true);
  };
  const handleModalSubmit = async (selectedSheet: string) => {
    await handleSendMessageWithDocument(selectedSheet);
    setModalVisible(false);

    // Create a POST request to the backend /querydoc
    // ...
  };

  const handleSendMessageWithDocument = async (docName: string) => {
    const newMessage = {
      message: inputValue,
      id: uuidv4(),
      isBot: false,
      avatar: '',
      timestamp: new Date().toISOString(),
    };
    message.loading('AI is thinking, this might take a while...');
    setInputValue('');
    const chatMessagesCopy = [...chatMessages];
    setChatMessages([...chatMessages, newMessage]);
    try {
      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/querydoc',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...newMessage, file: docName }),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        console.log('DATA', data);
        const incomingMessage = {
          id: uuidv4(),
          message: data,
          isBot: true,
          avatar:
            'https://cdn.dribbble.com/users/279657/screenshots/2701628/chatbot.png',
          timestamp: new Date().toISOString(),
        };
        setChatMessages([...chatMessagesCopy, newMessage, incomingMessage]);
      } else {
        throw new Error('Error querying chatbot');
      }
    } catch (error) {
      const incomingMessage = {
        id: uuidv4(),
        message: "Sorry, I didn't understand that. Please try again.",
        isBot: true,
        avatar:
          'https://cdn.dribbble.com/users/279657/screenshots/2701628/chatbot.png',
        timestamp: new Date().toISOString(),
      };
      setChatMessages([...chatMessagesCopy, newMessage, incomingMessage]);
      message.error(`Error querying bot: ${error}`);
    }
  };

  const handleSendMessage = async () => {
    const newMessage = {
      message: inputValue,
      id: uuidv4(),
      isBot: false,
      avatar: '',
      timestamp: new Date().toISOString(),
    };
    message.loading('AI is thinking, this might take a while...');
    setInputValue('');
    const chatMessagesCopy = [...chatMessages];
    setChatMessages([...chatMessages, newMessage]);
    try {
      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/query',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMessage),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        console.log('DATA', data);
        const incomingMessage = {
          id: uuidv4(),
          message: data,
          isBot: true,
          avatar:
            'https://cdn.dribbble.com/users/279657/screenshots/2701628/chatbot.png',
          timestamp: new Date().toISOString(),
        };
        setChatMessages([...chatMessagesCopy, newMessage, incomingMessage]);
      } else {
        throw new Error('Error querying chatbot');
      }
    } catch (error) {
      const incomingMessage = {
        id: uuidv4(),
        message: "Sorry, I didn't understand that. Please try again.",
        isBot: true,
        avatar:
          'https://cdn.dribbble.com/users/279657/screenshots/2701628/chatbot.png',
        timestamp: new Date().toISOString(),
      };
      setChatMessages([...chatMessagesCopy, newMessage, incomingMessage]);
      message.error(`Error querying bot: ${error}`);
    }
  };

  return (
    <div>
      <Modal
        title="Select a sheet that I am supposed to look from"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => handleModalSubmit}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a sheet"
          onChange={(value) => handleModalSubmit(value)}
        >
          {documentList.map((doc) =>
            doc.sheets?.map((sheet) => (
              <Select.Option key={sheet} value={sheet}>
                {sheet}
              </Select.Option>
            ))
          )}
        </Select>
      </Modal>

      <Card title="Chat" className="rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {chatMessages.map((chatMessage, index) => (
              <ChatListItem
                key={index}
                {...chatMessage}
                isLastBotMessage={
                  chatMessage.isBot && index === chatMessages.length - 1
                }
              />
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
