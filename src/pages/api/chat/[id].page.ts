import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
const fs = require('fs');
import { ChatMessage } from '../../../../types/chat';

const chatResponsesFilePath = path.join(
  process.cwd(),
  'pages/api/dummyJSON/chatResponses.json'
);
export const data = require('../dummyJSON/chatResponses.json');
export const writeNewData = (newData: any) => {
  fs.writeFileSync(
    `./src/pages/api/dummyJSON/chatResponses.json`,
    JSON.stringify(newData, null, 4)
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatMessage | any>
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (typeof id === 'string' && id in data) {
      const chatResponse = data[id];
      res.status(200).json(chatResponse);
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } else if (req.method === 'POST') {
    const existingData = fs.readFileSync(
      './src/pages/api/dummyJSON/chatResponses.json',
      'utf-8'
    );
    const data = JSON.parse(existingData);
    const newData = req.body;
    const chatId = 1;
    data[chatId].messages = [...data[chatId].messages, ...newData];
    writeNewData(data);
    res.status(200).json(data);
  }
}
