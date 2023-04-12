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
  Modal,
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
import * as XLSX from 'xlsx';
import ChatView from './ChatView';

const { Text } = Typography;
const { TextArea } = Input;

interface Document {
  name: string;
  file: File;
  progress: number;
}

type UploadViewProps = {
  setSheetData: React.Dispatch<React.SetStateAction<any[]>>;
  sheetData: any[];
  documentList: Document[];
  setDocumentList: React.Dispatch<React.SetStateAction<Document[]>>;
};

export const UploadView: React.FC<UploadViewProps> = ({
  setSheetData,
  sheetData,
  documentList,
  setDocumentList,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleFileUpload = (file: File) => {
    readSheets(file);
    setDocumentList([...documentList, { name: file.name, file, progress: 0 }]);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files[0]);
  };
  const handleSheetTitleChange = (index: number, title: string) => {
    setSheetData((sheetData) =>
      sheetData.map((sheet, i) => (i === index ? { ...sheet, title } : sheet))
    );
  };
  const handleModalOk = () => {
    // Start the upload process after the user clicks "OK"
    const file = sheetData[0]?.file;
    if (file) {
      uploadFile(file);
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  const readSheets = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheets = workbook.SheetNames.map((sheetName) => {
        return { name: sheetName, title: '', file };
      });
      setSheetData(sheets);
      setIsModalVisible(true);
    };
    reader.readAsBinaryString(file);
  };
  const uploadFile = (file: File) => {
    setDocumentList([...documentList, { name: file.name, file, progress: 0 }]);

    const uploadProgress = setInterval(() => {
      setDocumentList((documentList) => {
        const newList = [...documentList];
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
      setDocumentList((documentList) => {
        const newList = [...documentList];
        const itemIndex = newList.findIndex((item) => item.file === file);
        newList[itemIndex] = { ...newList[itemIndex], progress: 100 };
        return newList;
      });
      message.success(`${file.name} uploaded successfully`);
    }, 5000);
  };

  return (
    <div>
      <Modal
        title="Enter Sheet Titles"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <List
          dataSource={sheetData}
          renderItem={(item, index) => (
            <List.Item>
              <div className="flex items-center justify-between w-full">
                <Text className="w-1/4">{item.name}</Text>
                <Input
                  placeholder="Title"
                  className="w-3/4"
                  value={item.title}
                  onChange={(e) =>
                    handleSheetTitleChange(index, e.target.value)
                  }
                />
              </div>
            </List.Item>
          )}
        />
      </Modal>
      <div className="w-full p-4">
        <Card title="Upload Documents" className="rounded-lg" bordered={false}>
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
              accept=".xls,.xlsx"
            >
              <Button icon={<PlusOutlined />}>Select Excel File</Button>
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
  );
};
