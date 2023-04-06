import { useEffect, useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
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
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  FileOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { ChatMessage } from '../../../types/chat';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;
const { TextArea } = Input;

interface Document {
  name: string;
  file: File;
  progress: number;
}

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

export default function ChatApp() {
  const [inputValue, setInputValue] = useState('');
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch('/api/chat/1');
      const data = await response.json();
      setChatMessages(data.messages);
      console.log(data.messages);
    };

    fetchMessage();
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      return;
    }
    const updateMessage = async () => {
      const response = await fetch('/api/chat/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatMessages),
      });
      const data = await response.json();
      console.log(data);
    };
    updateMessage();
  }, [chatMessages]);

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

  const handleFileUpload = (file: File) => {
    setDocumentList([...documentList, { name: file.name, file, progress: 0 }]);

    const uploadProgress = setInterval(() => {
      setDocumentList((prevList) => {
        const newList = [...prevList];
        const itemIndex = newList.findIndex((item) => item.file === file);
        if (newList[itemIndex].progress < 100) {
          newList[itemIndex] = {
            ...newList[itemIndex],
            progress: newList[itemIndex].progress + 10,
          };
        } else {
          clearInterval(uploadProgress);
        }
        return newList;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(uploadProgress);
      setDocumentList((prevList) => {
        const newList = [...prevList];
        const itemIndex = newList.findIndex((item) => item.file === file);
        newList[itemIndex] = { ...newList[itemIndex], progress: 100 };
        return newList;
      });
      message.success(`${file.name} uploaded successfully`);
    }, 5000);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files[0]);
  };

  return (
    <div className="flex flex-row justify-between bg-gray-100 min-h-screen">
      <div className="w-1/4">
        <div className="w-full p-4">
          <Card
            title="Upload Documents"
            className="rounded-lg"
            bordered={false}
          >
            <div
              className="border-dashed border-2 border-gray-400 h-64 flex flex-col items-center justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-gray-500 mb-4">
                <p>Drag and drop your file here</p>
                <p>or</p>
              </div>
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              >
                <Button icon={<PlusOutlined />}>Select File</Button>
              </Upload>
            </div>
          </Card>
        </div>
        <div className="w-full p-4">
          <Card title="Documents" className="rounded-lg" bordered={false}>
            <List
              dataSource={documentList}
              renderItem={(item, index) => (
                <List.Item className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="items-center">
                      <Avatar icon={<FileOutlined />} className="mr-2" />
                      <Text>{item.name}</Text>
                    </div>
                    <div className="w-full">
                      {item.progress > 0 && item.progress < 100 && (
                        <Progress
                          percent={item.progress}
                          size="small"
                          className="ml-2"
                        />
                      )}
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      setDocumentList((prevList) =>
                        prevList.filter((_, i) => i !== index)
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
      <div className="w-3/4 p-4">
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
    </div>
  );
}
