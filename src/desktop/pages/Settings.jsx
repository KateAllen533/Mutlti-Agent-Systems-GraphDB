import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Switch, 
  Button, 
  Select, 
  InputNumber, 
  Divider,
  Typography,
  Row,
  Col,
  Space,
  message,
  Tabs
} from 'antd';
import { 
  SettingOutlined, 
  DatabaseOutlined, 
  ApiOutlined,
  SecurityScanOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Save settings to backend
      const response = await fetch('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        message.success('Settings saved successfully!');
        // Reload the page to apply new settings
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      message.error('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: 'Reset Settings',
      content: 'Are you sure you want to reset all settings to default values?',
      onOk: () => {
        form.resetFields();
        message.success('Settings reset to defaults');
      }
    });
  };

  const systemSettings = (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          maxFileSize: 50,
          maxConcurrentJobs: 5,
          autoStart: true,
          logLevel: 'info',
          retentionDays: 30
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="maxFileSize"
              label="Maximum File Size (MB)"
              tooltip="Maximum size for uploaded files"
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="maxConcurrentJobs"
              label="Maximum Concurrent Jobs"
              tooltip="Maximum number of jobs that can run simultaneously"
            >
              <InputNumber min={1} max={20} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="autoStart"
              label="Auto-start Agents"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="logLevel"
              label="Log Level"
            >
              <Select>
                <Option value="debug">Debug</Option>
                <Option value="info">Info</Option>
                <Option value="warn">Warning</Option>
                <Option value="error">Error</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="retentionDays"
              label="Data Retention (Days)"
              tooltip="How long to keep processed data"
            >
              <InputNumber min={1} max={365} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const databaseSettings = (
    <Card>
      <Form layout="vertical">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="neo4jUri"
              label="Neo4j URI"
              tooltip="Connection string for Neo4j database"
            >
              <Input placeholder="bolt://localhost:7687" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="neo4jUser"
              label="Neo4j Username"
            >
              <Input placeholder="neo4j" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="neo4jPassword"
              label="Neo4j Password"
            >
              <Input.Password placeholder="password" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="neo4jDatabase"
              label="Neo4j Database"
            >
              <Input placeholder="neo4j" />
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item
              name="connectionPool"
              label="Connection Pool Settings"
            >
              <TextArea 
                rows={4} 
                placeholder="Additional connection pool configuration"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const apiSettings = (
    <Card>
      <Form layout="vertical">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="openaiApiKey"
              label="OpenAI API Key"
              tooltip="API key for OpenAI GPT models"
            >
              <Input.Password placeholder="sk-..." />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="anthropicApiKey"
              label="Anthropic API Key"
              tooltip="API key for Anthropic Claude models"
            >
              <Input.Password placeholder="sk-ant-..." />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="ollamaUrl"
              label="Ollama URL"
              tooltip="URL for local Ollama server"
            >
              <Input placeholder="http://localhost:11434" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="ollamaModel"
              label="Ollama Model"
              tooltip="Model to use with Ollama"
            >
              <Input placeholder="llama2, codellama, mistral, etc." />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="openaiModel"
              label="OpenAI Model"
            >
              <Select defaultValue="gpt-4">
                <Option value="gpt-4">GPT-4</Option>
                <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                <Option value="gpt-4-turbo">GPT-4 Turbo</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="anthropicModel"
              label="Anthropic Model"
            >
              <Select defaultValue="claude-3-sonnet">
                <Option value="claude-3-opus">Claude 3 Opus</Option>
                <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
                <Option value="claude-3-haiku">Claude 3 Haiku</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="maxTokens"
              label="Maximum Tokens"
              tooltip="Maximum tokens for LLM responses"
            >
              <InputNumber min={100} max={4000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="temperature"
              label="Temperature"
              tooltip="Controls randomness in LLM responses (0-1)"
            >
              <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const securitySettings = (
    <Card>
      <Form layout="vertical">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="enableEncryption"
              label="Enable Data Encryption"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="enableAuditLog"
              label="Enable Audit Logging"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="sessionTimeout"
              label="Session Timeout (minutes)"
            >
              <InputNumber min={5} max={480} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="maxLoginAttempts"
              label="Maximum Login Attempts"
            >
              <InputNumber min={3} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item
              name="allowedIPs"
              label="Allowed IP Addresses"
              tooltip="Comma-separated list of allowed IP addresses (leave empty for all)"
            >
              <TextArea 
                rows={3} 
                placeholder="192.168.1.0/24, 10.0.0.0/8"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const notificationSettings = (
    <Card>
      <Form layout="vertical">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="emailNotifications"
              label="Email Notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="desktopNotifications"
              label="Desktop Notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="jobCompletion"
              label="Job Completion Alerts"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="errorAlerts"
              label="Error Alerts"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="emailAddress"
              label="Email Address"
            >
              <Input placeholder="admin@company.com" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpServer"
              label="SMTP Server"
            >
              <Input placeholder="smtp.company.com" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const tabItems = [
    {
      key: 'system',
      label: (
        <span>
          <SettingOutlined />
          System
        </span>
      ),
      children: systemSettings
    },
    {
      key: 'database',
      label: (
        <span>
          <DatabaseOutlined />
          Database
        </span>
      ),
      children: databaseSettings
    },
    {
      key: 'api',
      label: (
        <span>
          <ApiOutlined />
          API Keys
        </span>
      ),
      children: apiSettings
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined />
          Security
        </span>
      ),
      children: securitySettings
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: notificationSettings
    }
  ];

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={3}>Settings</Title>
            <Text type="secondary">
              Configure your multi-agent system preferences and connections
            </Text>
          </Card>
        </Col>

        <Col span={24}>
          <Tabs
            defaultActiveKey="system"
            items={tabItems}
            size="large"
          />
        </Col>

        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={5}>Save Changes</Title>
                <Text type="secondary">
                  Don't forget to save your settings
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button onClick={handleReset}>Reset to Defaults</Button>
                  <Button 
                    type="primary" 
                    loading={loading}
                    onClick={() => form.submit()}
                  >
                    Save Settings
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
