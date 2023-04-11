// pages/index.page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return null;
};

export default IndexPage;
