import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload, 
  message, 
  Table, 
  Tag,
  Space,
  Typography,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  DatabaseOutlined, 
  FileTextOutlined, 
  CloudOutlined,
  LinkOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const DataConnectors = () => {
  const [connectors, setConnectors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('file');
  const [form] = Form.useForm();

  const connectorTypes = [
    {
      key: 'file',
      title: 'File Upload',
      description: 'Upload CSV, Excel, or JSON files',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      key: 'database',
      title: 'Database Connection',
      description: 'Connect to SQLite, MySQL, PostgreSQL',
      icon: <DatabaseOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      key: 'api',
      title: 'API Endpoint',
      description: 'Connect to REST APIs and web services',
      icon: <LinkOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      color: '#faad14'
    },
    {
      key: 'cloud',
      title: 'Cloud Storage',
      description: 'Connect to AWS S3, Google Drive, Dropbox',
      icon: <CloudOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      color: '#722ed1'
    }
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {connectorTypes.find(t => t.key === record.type)?.icon}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const connectorType = connectorTypes.find(t => t.key === type);
        return (
          <Tag color={connectorType?.color}>
            {connectorType?.title}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          connected: { color: 'green', text: 'Connected' },
          disconnected: { color: 'red', text: 'Disconnected' },
          error: { color: 'orange', text: 'Error' }
        };
        const config = statusConfig[status] || statusConfig.disconnected;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsed',
      key: 'lastUsed'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<PlayCircleOutlined />}
            onClick={() => handleTestConnection(record)}
          >
            Test
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditConnector(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteConnector(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  useEffect(() => {
    // Load existing connectors
    loadConnectors();
  }, []);

  const loadConnectors = () => {
    // Mock data - in real app, this would come from API
    setConnectors([
      {
        id: 1,
        name: 'Employee Database',
        type: 'database',
        status: 'connected',
        lastUsed: '2 hours ago',
        connectionString: 'mysql://localhost:3306/employees'
      },
      {
        id: 2,
        name: 'Sales Data CSV',
        type: 'file',
        status: 'connected',
        lastUsed: '1 day ago',
        filePath: '/data/sales_2024.csv'
      },
      {
        id: 3,
        name: 'Customer API',
        type: 'api',
        status: 'error',
        lastUsed: '3 days ago',
        endpoint: 'https://api.customers.com/v1'
      }
    ]);
  };

  const handleConnectorClick = (type) => {
    setModalType(type);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Handle file upload
      if (modalType === 'file' && values.file) {
        const file = values.file.file || values.file;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', values.name);
        
        try {
          const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            message.success('File uploaded and processed successfully!');
            
            // Create new connector with file info
            const newConnector = {
              id: Date.now(),
              name: values.name,
              type: modalType,
              status: 'connected',
              lastUsed: 'Just now',
              filePath: result.filePath,
              fileName: file.name,
              fileSize: file.size
            };
            
            setConnectors(prev => [...prev, newConnector]);
            setIsModalVisible(false);
            return;
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          message.error('Failed to upload file: ' + error.message);
          return;
        }
      }
      
      // Create new connector for non-file types
      const newConnector = {
        id: Date.now(),
        name: values.name,
        type: modalType,
        status: 'connected',
        lastUsed: 'Just now',
        ...values
      };

      setConnectors(prev => [...prev, newConnector]);
      setIsModalVisible(false);
      message.success('Connector created successfully!');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleTestConnection = (connector) => {
    message.loading('Testing connection...', 2);
    setTimeout(() => {
      message.success('Connection test successful!');
    }, 2000);
  };

  const handleEditConnector = (connector) => {
    setModalType(connector.type);
    setIsModalVisible(true);
    form.setFieldsValue(connector);
  };

  const handleDeleteConnector = (id) => {
    Modal.confirm({
      title: 'Delete Connector',
      content: 'Are you sure you want to delete this connector?',
      onOk: () => {
        setConnectors(prev => prev.filter(c => c.id !== id));
        message.success('Connector deleted successfully!');
      }
    });
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'file':
        return (
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Connector Name"
              rules={[{ required: true, message: 'Please enter connector name' }]}
            >
              <Input placeholder="e.g., Sales Data CSV" />
            </Form.Item>
            
            <Form.Item
              name="file"
              label="Upload File"
              rules={[{ required: true, message: 'Please upload a file' }]}
            >
              <Dragger
                name="file"
                multiple={false}
                accept=".csv,.xlsx,.xls,.json"
                beforeUpload={(file) => {
                  // Store the file for later upload
                  form.setFieldValue('file', { file });
                  return false; // Prevent auto upload
                }}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                  } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                  }
                }}
              >
                <p className="ant-upload-drag-icon">
                  <FileTextOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for CSV, Excel, and JSON files
                </p>
              </Dragger>
            </Form.Item>
          </Form>
        );

      case 'database':
        return (
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Connector Name"
              rules={[{ required: true, message: 'Please enter connector name' }]}
            >
              <Input placeholder="e.g., Production Database" />
            </Form.Item>
            
            <Form.Item
              name="dbType"
              label="Database Type"
              rules={[{ required: true, message: 'Please select database type' }]}
            >
              <Select placeholder="Select database type">
                <Option value="mysql">MySQL</Option>
                <Option value="postgresql">PostgreSQL</Option>
                <Option value="sqlite">SQLite</Option>
                <Option value="mssql">SQL Server</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="host"
              label="Host"
              rules={[{ required: true, message: 'Please enter host' }]}
            >
              <Input placeholder="localhost" />
            </Form.Item>
            
            <Form.Item
              name="port"
              label="Port"
              rules={[{ required: true, message: 'Please enter port' }]}
            >
              <Input placeholder="3306" />
            </Form.Item>
            
            <Form.Item
              name="database"
              label="Database Name"
              rules={[{ required: true, message: 'Please enter database name' }]}
            >
              <Input placeholder="mydatabase" />
            </Form.Item>
            
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input placeholder="username" />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password placeholder="password" />
            </Form.Item>
          </Form>
        );

      case 'api':
        return (
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Connector Name"
              rules={[{ required: true, message: 'Please enter connector name' }]}
            >
              <Input placeholder="e.g., Customer API" />
            </Form.Item>
            
            <Form.Item
              name="endpoint"
              label="API Endpoint"
              rules={[{ required: true, message: 'Please enter API endpoint' }]}
            >
              <Input placeholder="https://api.example.com/v1" />
            </Form.Item>
            
            <Form.Item
              name="authType"
              label="Authentication Type"
            >
              <Select placeholder="Select authentication type">
                <Option value="none">None</Option>
                <Option value="basic">Basic Auth</Option>
                <Option value="bearer">Bearer Token</Option>
                <Option value="apiKey">API Key</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="apiKey"
              label="API Key"
            >
              <Input placeholder="Your API key" />
            </Form.Item>
          </Form>
        );

      case 'cloud':
        return (
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Connector Name"
              rules={[{ required: true, message: 'Please enter connector name' }]}
            >
              <Input placeholder="e.g., AWS S3 Bucket" />
            </Form.Item>
            
            <Form.Item
              name="cloudProvider"
              label="Cloud Provider"
              rules={[{ required: true, message: 'Please select cloud provider' }]}
            >
              <Select placeholder="Select cloud provider">
                <Option value="aws">AWS S3</Option>
                <Option value="gcp">Google Cloud Storage</Option>
                <Option value="azure">Azure Blob Storage</Option>
                <Option value="dropbox">Dropbox</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="bucket"
              label="Bucket/Container Name"
              rules={[{ required: true, message: 'Please enter bucket name' }]}
            >
              <Input placeholder="my-bucket" />
            </Form.Item>
            
            <Form.Item
              name="accessKey"
              label="Access Key"
              rules={[{ required: true, message: 'Please enter access key' }]}
            >
              <Input placeholder="Access key" />
            </Form.Item>
            
            <Form.Item
              name="secretKey"
              label="Secret Key"
              rules={[{ required: true, message: 'Please enter secret key' }]}
            >
              <Input.Password placeholder="Secret key" />
            </Form.Item>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={3}>Data Connectors</Title>
            <Text type="secondary">
              Connect to various data sources to feed your multi-agent system
            </Text>
          </Card>
        </Col>

        {/* Connector Types */}
        <Col span={24}>
          <Card title="Add New Connector">
            <Row gutter={[16, 16]}>
              {connectorTypes.map(type => (
                <Col xs={24} sm={12} md={6} key={type.key}>
                  <Card
                    hoverable
                    className="connector-card"
                    onClick={() => handleConnectorClick(type.key)}
                    style={{ 
                      border: `2px solid ${type.color}`,
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {type.icon}
                    <Title level={5} style={{ marginTop: 12, marginBottom: 8 }}>
                      {type.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {type.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Existing Connectors */}
        <Col span={24}>
          <Card 
            title="Existing Connectors" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalType('file')}
              >
                Add Connector
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={connectors}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal
        title={`Add ${connectorTypes.find(t => t.key === modalType)?.title}`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Create Connector"
        cancelText="Cancel"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default DataConnectors;
