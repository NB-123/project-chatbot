import { Button, Typography } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '../../components/MainLayout';

const { Title, Paragraph } = Typography;

export default function IndexPage() {
  const router = useRouter();

  const handleStartChat = () => {
    router.push('/chat');
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <Title
        level={1}
        style={{ color: '#F5F5F5' }}
        className="text-white mb-6 font-semibold"
      >
        Welcome to Tetrix Financial
      </Title>
      <Paragraph style={{ color: '#F5F5F5' }} className="text-center mb-12">
        A chat messaging platform that provides advice and guidance based on
        your business financial documents.
      </Paragraph>
      <div className="flex space-x-4 mt-10">
        <Button
          className="rounded-l-full hover:bg-blue-600"
          type="primary"
          size="large"
          href="/chat"
        >
          Get Started
        </Button>
        <Button
          className="rounded-r-full hover:bg-blue-600"
          type="default"
          size="large"
          href="/about"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
