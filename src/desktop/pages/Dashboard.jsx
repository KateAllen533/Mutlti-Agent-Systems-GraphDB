import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Avatar, Badge, Button, Space, Typography } from 'antd';
import { 
  DatabaseOutlined, 
  NodeIndexOutlined, 
  BarChartOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Text } = Typography;

const Dashboard = () => {
  const [agentStatus, setAgentStatus] = useState({
    dataLoader: 'running',
    dataStructuring: 'running',
    graphModeling: 'running'
  });
  const [systemMetrics, setSystemMetrics] = useState({
    totalJobs: 156,
    completedJobs: 142,
    activeJobs: 3,
    failedJobs: 11,
    dataProcessed: 2.4,
    avgProcessingTime: 1.2
  });

  const [recentJobs, setRecentJobs] = useState([
    { id: 1, name: 'Employee Data Processing', status: 'completed', time: '2 min ago', progress: 100 },
    { id: 2, name: 'Sales Analytics', status: 'processing', time: '5 min ago', progress: 75 },
    { id: 3, name: 'Customer Database', status: 'completed', time: '10 min ago', progress: 100 },
    { id: 4, name: 'Financial Reports', status: 'failed', time: '15 min ago', progress: 45 },
    { id: 5, name: 'Inventory Management', status: 'processing', time: '20 min ago', progress: 30 }
  ]);

  const performanceData = [
    { time: '00:00', jobs: 4, processing: 2.1 },
    { time: '04:00', jobs: 2, processing: 1.8 },
    { time: '08:00', jobs: 8, processing: 2.3 },
    { time: '12:00', jobs: 12, processing: 2.8 },
    { time: '16:00', jobs: 15, processing: 3.2 },
    { time: '20:00', jobs: 6, processing: 2.5 }
  ];

  const agentDistribution = [
    { name: 'Data Loader', value: 35, color: '#1890ff' },
    { name: 'Data Structuring', value: 30, color: '#52c41a' },
    { name: 'Graph Modeling', value: 25, color: '#faad14' },
    { name: 'Other', value: 10, color: '#f5222d' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'stopped':
        return <PauseCircleOutlined style={{ color: '#d9d9d9' }} />;
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'processing':
        return '#1890ff';
      case 'failed':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update metrics
      setSystemMetrics(prev => ({
        ...prev,
        dataProcessed: prev.dataProcessed + Math.random() * 0.1,
        avgProcessingTime: prev.avgProcessingTime + (Math.random() - 0.5) * 0.1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]} className="dashboard-grid">
        {/* System Overview */}
        <Col span={24}>
          <Card title="System Overview" extra={
            <Space>
              <Button icon={<PlayCircleOutlined />} type="primary" size="small">
                Start All
              </Button>
              <Button icon={<PauseCircleOutlined />} size="small">
                Stop All
              </Button>
              <Button icon={<ReloadOutlined />} size="small">
                Refresh
              </Button>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Jobs"
                  value={systemMetrics.totalJobs}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Completed Jobs"
                  value={systemMetrics.completedJobs}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Active Jobs"
                  value={systemMetrics.activeJobs}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Failed Jobs"
                  value={systemMetrics.failedJobs}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Agent Status */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="Agent Status" size="small" className="content-card">
            <List
              dataSource={[
                { name: 'Data Loader', status: agentStatus.dataLoader, description: 'Handles data ingestion from various sources' },
                { name: 'Data Structuring', status: agentStatus.dataStructuring, description: 'Processes and structures raw data' },
                { name: 'Graph Modeling', status: agentStatus.graphModeling, description: 'Creates graph models and relationships' }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getStatusIcon(item.status)} />}
                    title={
                      <Space>
                        <span>{item.name}</span>
                        <Badge 
                          status={item.status === 'running' ? 'success' : item.status === 'processing' ? 'processing' : 'default'} 
                          text={item.status}
                        />
                      </Space>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Performance Metrics */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="Performance Metrics" size="small" className="content-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Data Processed (GB)"
                  value={systemMetrics.dataProcessed.toFixed(1)}
                  precision={1}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Avg Processing Time (min)"
                  value={systemMetrics.avgProcessingTime.toFixed(1)}
                  precision={1}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Text>System Load</Text>
                <Progress percent={75} size="small" />
              </div>
              <div>
                <Text>Memory Usage</Text>
                <Progress percent={60} size="small" />
              </div>
            </div>
          </Card>
        </Col>

        {/* Performance Chart */}
        <Col xs={24} lg={16}>
          <Card title="Performance Over Time" className="content-card">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="jobs" stroke="#1890ff" strokeWidth={2} />
                <Line type="monotone" dataKey="processing" stroke="#52c41a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Agent Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Agent Distribution" className="content-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Recent Jobs */}
        <Col span={24}>
          <Card title="Recent Jobs" extra={<Button type="link">View All</Button>} className="content-card">
            <List
              dataSource={recentJobs}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">View</Button>,
                    <Button type="link" size="small">Retry</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getStatusIcon(item.status)} />}
                    title={item.name}
                    description={
                      <Space>
                        <span>{item.time}</span>
                        <Progress 
                          percent={item.progress} 
                          size="small" 
                          strokeColor={getStatusColor(item.status)}
                          style={{ width: 100 }}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
