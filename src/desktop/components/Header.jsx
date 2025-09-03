import React from 'react';
import { Button, Space, Switch, Typography, Badge } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const Header = ({ collapsed, onToggle, darkMode, onDarkModeToggle }) => {
  return (
    <div className="header-content">
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={onToggle}
          className="sidebar-toggle-btn"
          style={{ 
            fontSize: '16px', 
            width: 48, 
            height: 48,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            marginRight: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa'
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        />
        
        <div>
          <Text strong style={{ fontSize: 18 }}>
            Multi-Agent Data System
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Desktop Application
          </Text>
        </div>
      </div>

      <div className="header-right">
        <Space size="middle">
          <Badge count={3} size="small">
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              size="large"
            />
          </Badge>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 12 }}>Dark</Text>
            <Switch 
              checked={darkMode} 
              onChange={onDarkModeToggle}
              size="small"
            />
            <Text style={{ fontSize: 12 }}>Light</Text>
          </div>
          
          <Button 
            type="text" 
            icon={<UserOutlined />} 
            size="large"
          />
          
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            size="large"
          />
        </Space>
      </div>
    </div>
  );
};

export default Header;
