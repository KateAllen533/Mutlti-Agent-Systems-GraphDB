import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Select, 
  Slider, 
  Switch, 
  Typography, 
  Row, 
  Col,
  Timeline,
  Badge,
  Tooltip,
  Modal,
  Form,
  Input
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  NodeIndexOutlined,
  DatabaseOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

const { Title, Text } = Typography;
const { Option } = Select;

// Register dagre layout
cytoscape.use(dagre);

const WorkflowViewer = () => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState(null);
  const [settings, setSettings] = useState({
    autoLayout: true,
    showLabels: true,
    animationSpeed: 1.0,
    showMetrics: true
  });

  const workflowSteps = [
    {
      id: 'data-source',
      name: 'Data Source',
      type: 'source',
      status: 'completed',
      description: 'Data loaded from CSV file',
      metrics: { records: 1000, size: '2.4 MB' }
    },
    {
      id: 'data-loader',
      name: 'Data Loader Agent',
      type: 'agent',
      status: 'completed',
      description: 'Parsed and validated data',
      metrics: { processed: 1000, errors: 0, time: '1.2s' }
    },
    {
      id: 'data-structuring',
      name: 'Data Structuring Agent',
      type: 'agent',
      status: 'processing',
      description: 'Cleaning and normalizing data',
      metrics: { cleaned: 850, normalized: 850, time: '2.1s' }
    },
    {
      id: 'graph-modeling',
      name: 'Graph Modeling Agent',
      type: 'agent',
      status: 'pending',
      description: 'Creating graph relationships',
      metrics: { nodes: 0, edges: 0, time: '0s' }
    },
    {
      id: 'insights',
      name: 'Insights Generation',
      type: 'output',
      status: 'pending',
      description: 'Generating analytics and insights',
      metrics: { insights: 0, patterns: 0, time: '0s' }
    }
  ];

  const nodeTypes = {
    source: { color: '#52c41a', shape: 'ellipse' },
    agent: { color: '#1890ff', shape: 'rectangle' },
    output: { color: '#faad14', shape: 'diamond' }
  };

  useEffect(() => {
    initializeCytoscape();
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (cyRef.current) {
      updateWorkflow();
    }
  }, [workflowSteps, settings]);

  const initializeCytoscape = () => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1890ff',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': 'white',
            'font-size': '12px',
            'font-weight': 'bold',
            'width': '80px',
            'height': '40px',
            'border-width': 2,
            'border-color': '#fff'
          }
        },
        {
          selector: 'node[type="source"]',
          style: {
            'background-color': '#52c41a',
            'shape': 'ellipse',
            'width': '60px',
            'height': '60px'
          }
        },
        {
          selector: 'node[type="agent"]',
          style: {
            'background-color': '#1890ff',
            'shape': 'rectangle'
          }
        },
        {
          selector: 'node[type="output"]',
          style: {
            'background-color': '#faad14',
            'shape': 'diamond',
            'width': '60px',
            'height': '60px'
          }
        },
        {
          selector: 'node[status="completed"]',
          style: {
            'border-color': '#52c41a',
            'border-width': 3
          }
        },
        {
          selector: 'node[status="processing"]',
          style: {
            'border-color': '#1890ff',
            'border-width': 3,
            'background-color': '#e6f7ff'
          }
        },
        {
          selector: 'node[status="pending"]',
          style: {
            'border-color': '#d9d9d9',
            'border-width': 2,
            'background-color': '#f5f5f5',
            'color': '#8c8c8c'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#1890ff',
            'target-arrow-color': '#1890ff',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        spacingFactor: 1.5,
        nodeSep: 50,
        edgeSep: 20
      }
    });

    // Add event listeners
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      showNodeDetails(node.data());
    });
  };

  const updateWorkflow = () => {
    if (!cyRef.current) return;

    const elements = [];
    
    // Add nodes
    workflowSteps.forEach((step, index) => {
      elements.push({
        data: {
          id: step.id,
          label: settings.showLabels ? step.name : '',
          type: step.type,
          status: step.status,
          ...step
        },
        position: { x: index * 200, y: 100 }
      });
    });

    // Add edges
    for (let i = 0; i < workflowSteps.length - 1; i++) {
      elements.push({
        data: {
          id: `edge-${i}`,
          source: workflowSteps[i].id,
          target: workflowSteps[i + 1].id,
          label: settings.showLabels ? '→' : ''
        }
      });
    }

    cyRef.current.json({ elements });
    
    if (settings.autoLayout) {
      cyRef.current.layout({
        name: 'dagre',
        rankDir: 'LR',
        spacingFactor: 1.5,
        nodeSep: 50,
        edgeSep: 20
      }).run();
    }

    cyRef.current.fit();
  };

  const showNodeDetails = (nodeData) => {
    Modal.info({
      title: nodeData.name,
      content: (
        <div>
          <p><strong>Type:</strong> {nodeData.type}</p>
          <p><strong>Status:</strong> {nodeData.status}</p>
          <p><strong>Description:</strong> {nodeData.description}</p>
          {nodeData.metrics && (
            <div>
              <p><strong>Metrics:</strong></p>
              <ul>
                {Object.entries(nodeData.metrics).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
      width: 500
    });
  };

  const handleStartWorkflow = () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    // Simulate workflow execution
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= workflowSteps.length - 1) {
          setIsRunning(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const handleStopWorkflow = () => {
    setIsRunning(false);
  };

  const handleResetWorkflow = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setWorkflowData(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Badge status="success" />;
      case 'processing':
        return <Badge status="processing" />;
      case 'pending':
        return <Badge status="default" />;
      default:
        return <Badge status="default" />;
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Workflow Controls */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3}>Agent Workflow</Title>
                <Text type="secondary">
                  Monitor and control the multi-agent data processing workflow
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleStartWorkflow}
                    disabled={isRunning}
                  >
                    Start Workflow
                  </Button>
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={handleStopWorkflow}
                    disabled={!isRunning}
                  >
                    Stop
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetWorkflow}
                  >
                    Reset
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setSettings({...settings, showSettings: true})}
                  >
                    Settings
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Workflow Visualization */}
        <Col xs={24} lg={16}>
          <Card title="Workflow Diagram" extra={
            <Space>
              <Text>Auto Layout</Text>
              <Switch
                checked={settings.autoLayout}
                onChange={(checked) => setSettings({...settings, autoLayout: checked})}
                size="small"
              />
              <Text>Show Labels</Text>
              <Switch
                checked={settings.showLabels}
                onChange={(checked) => setSettings({...settings, showLabels: checked})}
                size="small"
              />
            </Space>
          }>
            <div
              ref={containerRef}
              style={{
                width: '100%',
                height: '500px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                background: '#fafafa'
              }}
            />
          </Card>
        </Col>

        {/* Workflow Timeline */}
        <Col xs={24} lg={8}>
          <Card title="Execution Timeline">
            <Timeline>
              {workflowSteps.map((step, index) => (
                <Timeline.Item
                  key={step.id}
                  dot={getStatusIcon(step.status)}
                  color={step.status === 'completed' ? 'green' : 
                         step.status === 'processing' ? 'blue' : 'gray'}
                >
                  <div>
                    <Text strong>{step.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {step.description}
                    </Text>
                    {settings.showMetrics && step.metrics && (
                      <div style={{ marginTop: 4 }}>
                        {Object.entries(step.metrics).map(([key, value]) => (
                          <Text key={key} style={{ fontSize: 11, color: '#8c8c8c' }}>
                            {key}: {value}{' '}
                          </Text>
                        ))}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Agent Details */}
        <Col span={24}>
          <Card title="Agent Details">
            <Row gutter={[16, 16]}>
              {workflowSteps.filter(step => step.type === 'agent').map(agent => (
                <Col xs={24} sm={12} md={8} key={agent.id}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        {agent.type === 'agent' && <NodeIndexOutlined />}
                        {agent.name}
                        {getStatusIcon(agent.status)}
                      </Space>
                    }
                    extra={
                      <Tooltip title={agent.description}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    }
                  >
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {agent.description}
                      </Text>
                      {agent.metrics && (
                        <div style={{ marginTop: 8 }}>
                          {Object.entries(agent.metrics).map(([key, value]) => (
                            <div key={key} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              fontSize: 12
                            }}>
                              <Text type="secondary">{key}:</Text>
                              <Text strong>{value}</Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowViewer;
