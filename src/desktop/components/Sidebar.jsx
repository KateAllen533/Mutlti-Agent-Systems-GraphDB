import React from 'react';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

const Sidebar = ({ collapsed, menuItems, currentPage, onPageChange }) => {
  const handleMenuClick = ({ key }) => {
    onPageChange(key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      className={`sidebar ${collapsed ? 'ant-layout-sider-collapsed' : ''}`}
      width={240}
      collapsedWidth={0}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'hidden'
      }}
    >
      {!collapsed && (
        <>
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#1890ff',
              textAlign: 'center'
            }}>
              Multi-Agent System
            </div>
          </div>
          
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              borderRight: 0,
              marginTop: 16,
              background: 'transparent'
            }}
          />
          
          <div style={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16, 
            right: 16,
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: 6,
            fontSize: 12,
            color: '#8c8c8c',
            textAlign: 'center'
          }}>
            Version 1.0.0
          </div>
        </>
      )}
    </Sider>
  );
};

export default Sidebar;
