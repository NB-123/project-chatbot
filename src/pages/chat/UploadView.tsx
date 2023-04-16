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
  Popconfirm,
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
import { CustomDocument } from '../../../types/chat/CustomDocument';

const { Text } = Typography;
const { TextArea } = Input;

type UploadViewProps = {
  setSheetData: React.Dispatch<React.SetStateAction<any[]>>;
  sheetData: any[];
  documentList: CustomDocument[];
  setDocumentList: React.Dispatch<React.SetStateAction<CustomDocument[]>>;
};

export const UploadView: React.FC<UploadViewProps> = ({
  setSheetData,
  sheetData,
  documentList,
  setDocumentList,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/documents'
      );
      if (response.ok) {
        const fetchedDocuments: { file: string; children: string[] }[] =
          await response.json();

        if (fetchedDocuments.length === 0) {
          return;
        }
        const updatedDocumentList = fetchedDocuments.map((doc) => ({
          name: doc.file,
          file: null,
          progress: 100,
          id: 'fetched',
          sheets: doc.children,
        }));
        // Map fetchedDocuments to the existing documentList format
        // const updatedDocumentList = fetchedDocuments.map((doc) => ({
        //   name: doc.file,
        //   file: new File([], doc.file),
        //   progress: 100, // Assuming all fetched documents are fully uploaded
        //   id: doc.id,
        //   url: doc.url,
        // }));
        setDocumentList([...updatedDocumentList]);
      } else {
        throw new Error('Fetching documents failed!');
      }
    } catch (error) {
      message.error(`Error fetching documents: ${error}`);
    }
    setIsLoadingDocuments(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const submitFileDescription = async (fileDescription: object) => {
    try {
      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/descriptions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileDescription),
        }
      );

      if (response.ok) {
        message.success('File description submitted successfully');
        fetchDocuments();
      } else {
        throw new Error('Submitting file description failed');
      }
    } catch (error) {
      message.error(`Error submitting file description: ${error}`);
    }
  };
  const handleFileUpload = (file: File) => {
    readSheets(file);
    // const fileId = uuidv4();
    // setDocumentList([...documentList, { name: file.name, file, progress: 0, id: fileId }]);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    let supported = true;

    for (let i = 0; i < files.length; i++) {
      const fileType = files[i].type;
      const fileExtension = files[i].name.split('.').pop()?.toLowerCase();

      if (
        fileType !==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        fileType !== 'application/vnd.ms-excel' &&
        fileType !== 'text/csv' &&
        fileType !==
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        fileType !== 'application/msword' &&
        fileExtension !== 'xls' &&
        fileExtension !== 'xlsx' &&
        fileExtension !== 'csv' &&
        // fileExtension !== 'doc' &&
        // fileExtension !== 'docx' &&
        fileExtension !== 'pdf'
      ) {
        supported = false;
        message.error(
          'Your file type is not csv, xls, xlsx, pdf, (future: doc, docs)'
        );
        break;
      }
    }

    if (supported) {
      handleFileUpload(files[0]);
    }
  };

  const handleSheetTitleChange = (index: number, title: string) => {
    setSheetData((sheetData) =>
      sheetData.map((sheet, i) => (i === index ? { ...sheet, title } : sheet))
    );
  };
  const handleModalOk = async () => {
    // Start the upload process after the user clicks "OK"

    const file = sheetData[0]?.file;
    if (file) {
      // Submit file description after successful file upload
      const fileDescription = sheetData.map(({ name, title }) => ({
        file: name,
        description: title,
      }));
      submitFileDescription(fileDescription);
      uploadFile(file);
    }
    setIsModalVisible(false);
    fetchDocuments();
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

  const uploadFile = async (file: File) => {
    const fileId = uuidv4();
    setDocumentList([
      ...documentList,
      {
        name: file.name,
        file,
        progress: 0,
        id: fileId,
        sheets: [],
      },
    ]);
    setIsUploading(true);
    setIsModalVisible(false);
    message.loading('Uploading file...');
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('id', fileId);

      const response = await fetch(
        'https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        setDocumentList((prevList) => {
          const newList = [...prevList];
          const itemIndex = newList.findIndex((item) => item.file === file);
          newList[itemIndex] = { ...newList[itemIndex], progress: 100 };
          return newList;
        });
        message.success(`${file.name} uploaded successfully`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      message.error(`Error uploading file: ${error}`);
    } finally {
      setIsUploading(false); // Set isUploading to false when the upload finishes or encounters an error
    }
  };

  const handleDeleteFile = async (item: CustomDocument, index: number) => {
    // Call the DELETE endpoint
    try {
      const response = await fetch(
        `https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/documents`,
        {
          method: 'DELETE',
          body: JSON.stringify({ file: item.name }),
        }
      );
      if (response.ok) {
        message.success('Document deleted successfully');
        fetchDocuments();
        // setDocumentList((prevList) => prevList.filter((_, i) => i !== index));
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      message.error(`Error deleting document: ${error}`);
    }
  };
  console.log('files', documentList);

  return (
    <div>
      <Modal
        title="Enter Sheet Titles"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{ loading: isUploading, disabled: isUploading }}
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
              accept=".xls,.xlsx,.csv"
            >
              <Button icon={<PlusOutlined />}>Select Excel File</Button>
            </Upload>
          </div>
        </Card>
      </div>
      <div className="w-full p-4">
        <Card
          title="Documents"
          className="rounded-lg"
          bordered={false}
          loading={isLoadingDocuments}
        >
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
                <Popconfirm
                  title="Are you sure you want to delete?"
                  onConfirm={() => handleDeleteFile(item, index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};
