import React from 'react';
import { Link } from 'react-router-dom';

function SidebarMenuItem({ item, isActive, collapsed }) {
  return (
    <Link to={item.path} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 12,
          padding: collapsed ? '12px 10px' : '12px 14px',
          marginBottom: 6,
          borderRadius: 14,
          background: isActive ? '#f5f3ff' : 'transparent',
          border: isActive ? '1px solid #ddd6fe' : '1px solid transparent',
          color: isActive ? '#6d28d9' : '#475569',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>
            {item.icon}
          </span>

          {!collapsed && (
            <span
              style={{
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.label}
            </span>
          )}
        </div>

        {!collapsed && isActive && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#7c3aed',
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </Link>
  );
}

export default SidebarMenuItem;