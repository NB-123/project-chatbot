import React from 'react';
import { ChatMessage } from '../../../types/chat';
import { Typography, Avatar } from 'antd';

const { Text } = Typography;

export const ChatListItem = ({
  message,
  isBot,
  avatar,
  timestamp,
}: ChatMessage) => {
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
