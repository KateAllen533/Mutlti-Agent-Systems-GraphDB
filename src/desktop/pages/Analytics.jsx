import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Select, 
  DatePicker, 
  Button, 
  Space,
  Typography,
  Progress,
  List,
  Avatar,
  Badge
} from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({});

  // Mock data
  const performanceData = [
    { time: '00:00', jobs: 4, processing: 2.1, errors: 0 },
    { time: '04:00', jobs: 2, processing: 1.8, errors: 0 },
    { time: '08:00', jobs: 8, processing: 2.3, errors: 1 },
    { time: '12:00', jobs: 12, processing: 2.8, errors: 2 },
    { time: '16:00', jobs: 15, processing: 3.2, errors: 1 },
    { time: '20:00', jobs: 6, processing: 2.5, errors: 0 }
  ];

  const agentPerformance = [
    { agent: 'Data Loader', jobs: 45, avgTime: 1.2, success: 98, efficiency: 95 },
    { agent: 'Data Structuring', jobs: 42, avgTime: 2.1, success: 96, efficiency: 92 },
    { agent: 'Graph Modeling', jobs: 38, avgTime: 3.5, success: 94, efficiency: 88 }
  ];

  const dataSourceDistribution = [
    { name: 'CSV Files', value: 45, color: '#1890ff' },
    { name: 'Excel Files', value: 25, color: '#52c41a' },
    { name: 'JSON Files', value: 15, color: '#faad14' },
    { name: 'Database', value: 10, color: '#f5222d' },
    { name: 'API', value: 5, color: '#722ed1' }
  ];

  const errorAnalysis = [
    { type: 'Connection Timeout', count: 12, percentage: 35 },
    { type: 'Data Validation', count: 8, percentage: 24 },
    { type: 'Memory Limit', count: 6, percentage: 18 },
    { type: 'Format Error', count: 4, percentage: 12 },
    { type: 'Other', count: 4, percentage: 11 }
  ];

  const topDataSources = [
    { name: 'Employee Database', jobs: 156, lastUsed: '2 hours ago', status: 'active' },
    { name: 'Sales Data CSV', jobs: 89, lastUsed: '1 day ago', status: 'active' },
    { name: 'Customer API', jobs: 67, lastUsed: '3 days ago', status: 'error' },
    { name: 'Financial Reports', jobs: 45, lastUsed: '1 week ago', status: 'inactive' },
    { name: 'Inventory System', jobs: 23, lastUsed: '2 weeks ago', status: 'inactive' }
  ];

  const systemMetrics = {
    totalJobs: 156,
    completedJobs: 142,
    failedJobs: 14,
    avgProcessingTime: 2.1,
    dataProcessed: 2.4,
    systemUptime: 99.2,
    errorRate: 8.9
  };

  useEffect(() => {
    // Load analytics data based on time range
    loadAnalyticsData();
  }, [timeRange, selectedMetric]);

  const loadAnalyticsData = () => {
    // Mock API call
    setAnalyticsData({
      performance: performanceData,
      agents: agentPerformance,
      sources: dataSourceDistribution,
      errors: errorAnalysis,
      topSources: topDataSources
    });
  };

  const handleExport = () => {
    // Export analytics data
    console.log('Exporting analytics data...');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'error': return 'red';
      case 'inactive': return 'gray';
      default: return 'blue';
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3}>Analytics Dashboard</Title>
                <Text type="secondary">
                  Comprehensive insights into your multi-agent system performance
                </Text>
              </Col>
              <Col>
                <Space>
                  <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    style={{ width: 120 }}
                  >
                    <Option value="1d">Last 24h</Option>
                    <Option value="7d">Last 7 days</Option>
                    <Option value="30d">Last 30 days</Option>
                    <Option value="90d">Last 90 days</Option>
                  </Select>
                  <RangePicker />
                  <Button icon={<ReloadOutlined />} onClick={loadAnalyticsData}>
                    Refresh
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Key Metrics */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Jobs"
                  value={systemMetrics.totalJobs}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Success Rate"
                  value={((systemMetrics.completedJobs / systemMetrics.totalJobs) * 100).toFixed(1)}
                  suffix="%"
                                     prefix={<ArrowUpOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Avg Processing Time"
                  value={systemMetrics.avgProcessingTime}
                  suffix="min"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Data Processed"
                  value={systemMetrics.dataProcessed}
                  suffix="GB"
                  prefix={<PieChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Performance Chart */}
        <Col xs={24} lg={16}>
          <Card title="Performance Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="jobs" 
                  stackId="1" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="processing" 
                  stackId="2" 
                  stroke="#52c41a" 
                  fill="#52c41a" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="errors" 
                  stackId="3" 
                  stroke="#f5222d" 
                  fill="#f5222d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Data Source Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Data Source Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataSourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataSourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Agent Performance */}
        <Col xs={24} lg={12}>
          <Card title="Agent Performance">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#1890ff" />
                <Bar dataKey="success" fill="#52c41a" />
                <Bar dataKey="efficiency" fill="#faad14" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Error Analysis */}
        <Col xs={24} lg={12}>
          <Card title="Error Analysis">
            <List
              dataSource={errorAnalysis}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.type}
                    description={
                      <div>
                        <Progress 
                          percent={item.percentage} 
                          size="small" 
                          strokeColor="#f5222d"
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.count} errors ({item.percentage}%)
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Top Data Sources */}
        <Col span={24}>
          <Card title="Top Data Sources">
            <List
              dataSource={topDataSources}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Badge 
                      status={getStatusColor(item.status)} 
                      text={item.status}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<BarChartOutlined />} />}
                    title={item.name}
                    description={
                      <Space>
                        <Text type="secondary">{item.jobs} jobs</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">Last used: {item.lastUsed}</Text>
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

export default Analytics;
