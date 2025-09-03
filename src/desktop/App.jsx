import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { 
  DashboardOutlined, 
  DatabaseOutlined, 
  NodeIndexOutlined, 
  BarChartOutlined,
  SettingOutlined 
} from '@ant-design/icons';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataConnectors from './pages/DataConnectors';
import WorkflowViewer from './pages/WorkflowViewer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import './App.css';

const { Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Listen for menu events from Electron
    if (window.electronAPI) {
      window.electronAPI.onNavigateTo((event, page) => {
        setCurrentPage(page);
      });

      window.electronAPI.onMenuNewProject(() => {
        // Handle new project
        console.log('New project requested');
      });

      window.electronAPI.onFileOpened((event, filePath) => {
        // Handle file opened
        console.log('File opened:', filePath);
      });
    }
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: 'connectors',
      icon: <DatabaseOutlined />,
      label: 'Data Connectors'
    },
    {
      key: 'workflow',
      icon: <NodeIndexOutlined />,
      label: 'Agent Workflow'
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'connectors':
        return <DataConnectors />;
      case 'workflow':
        return <WorkflowViewer />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar 
          collapsed={collapsed}
          menuItems={menuItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        
        <Layout style={{ marginLeft: collapsed ? 0 : 240, transition: 'margin-left 0.3s ease' }}>
          <Header 
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            darkMode={darkMode}
            onDarkModeToggle={() => setDarkMode(!darkMode)}
          />
          
          <Content style={{ 
            margin: '16px', 
            overflow: 'auto',
            minHeight: 'calc(100vh - 64px)',
            padding: '0 16px'
          }}>
            {renderCurrentPage()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
