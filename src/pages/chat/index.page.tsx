import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import MainLayout from '../../../components/MainLayout';
import { useEffect, useState } from 'react';
import { UploadView } from './UploadView';
import { CustomDocument } from '../../../types/chat/CustomDocument';
import ChatView from './ChatView';
import { ChatMessage } from '../../../types/chat';
// import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [documentList, setDocumentList] = useState<CustomDocument[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sheetData, setSheetData] = useState<any[]>([]);

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch('/api/chat/1', { method: 'GET' });
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
  return (
    <MainLayout>
      <Head>
        <title>Tetrix ChatBot</title>
        <meta
          name="description"
          content="Helping you understand your business better."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>Home</h1>
        <div className="flex flex-row justify-between bg-gray-100 min-h-screen">
          <div className="w-1/4">
            <UploadView
              setSheetData={setSheetData}
              sheetData={sheetData}
              documentList={documentList}
              setDocumentList={setDocumentList}
            />
          </div>
          <div className="w-3/4 p-4">
            <ChatView
              setChatMessages={setChatMessages}
              chatMessages={chatMessages}
              documentList={documentList}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
