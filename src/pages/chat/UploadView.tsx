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
  ReloadOutlined,
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
  const [fetchError, setFetchError] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentList([]);
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
        setDocumentList([...updatedDocumentList]);
      } else {
        throw new Error('Fetching documents failed!');
      }
    } catch (error) {
      message.error(`Error fetching documents: ${error}`);
      setFetchError(true);
    } finally {
      setIsLoadingDocuments(false);
    }

    // Set fetchError state to true after 10 seconds if the documents could not be fetched
    setTimeout(() => {
      if (!documentList.length) {
        setFetchError(true);
      }
    }, 10000);
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
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      readSheets(file);
    } else {
      setSheetData([
        {
          name: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          file,
        },
      ]);
      setIsModalVisible(true);
    }
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
        // fileType !==
        //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        // fileType !== 'application/msword' &&
        fileExtension !== 'xls' &&
        fileExtension !== 'xlsx' &&
        fileExtension !== 'csv' &&
        // fileExtension !== 'doc' &&
        // fileExtension !== 'docx' &&
        fileExtension !== 'pdf'
      ) {
        supported = false;
        message.error('Your file type is not csv, xls, xlsx, pdf.');
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
        return {
          name: `${file.name.replace(/\.[^/.]+$/, '')}_${sheetName}`.replace(
            /_/g,
            ' '
          ),
          title: `${file.name.replace(/\.[^/.]+$/, '')} ${sheetName}`.replace(
            /_/g,
            ' '
          ),
          file,
        };
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
      fetchDocuments();
    }
  };

  const handleDeleteFile = async (item: CustomDocument, index: number) => {
    // Call the DELETE endpoint
    try {
      console.log('HANDLE delete file', item, item.name);
      const response = await fetch(
        `https://hzewc7wqp5.us-east-2.awsapprunner.com/chatbot/documents/${item.name}`,
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
    } finally {
      fetchDocuments();
    }
  };

  return (
    <div>
      <Modal
        title={
          <div>
            <Typography.Title level={5} className="m-0 p-0">
              Enter Description.
            </Typography.Title>
            <Typography.Text type="secondary">
              Please improve the description by providing more details. This
              will increase the accuracy of responses you get from the AI
              Chatbot.
            </Typography.Text>
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{ loading: isUploading, disabled: isUploading }}
        width={1000}
      >
        <List
          dataSource={sheetData}
          renderItem={(item, index) => (
            <List.Item key={item.name}>
              <div className="flex items-center justify-between w-full">
                <Text className="w-1/4">{item.name}</Text>
                <Input
                  placeholder="Description"
                  className="w-3/4"
                  defaultValue={item.title} // BUG IS HERE!
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
              accept=".xls,.xlsx,.csv,.pdf"
            >
              <Button icon={<PlusOutlined />}>Select File</Button>
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
          extra={
            <Button
              type="primary"
              onClick={fetchDocuments}
              loading={isLoadingDocuments}
              icon={<ReloadOutlined />}
            ></Button>
          }
        >
          <List
            dataSource={documentList.filter(
              (item) => item.name !== 'General Query'
            )}
            renderItem={(item, index) => {
              if (item.name === 'General Query') {
                return;
              }
              return (
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
              );
            }}
          />
        </Card>
      </div>
    </div>
  );
};
