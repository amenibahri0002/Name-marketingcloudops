import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function SidebarMenuItem({ item, isActive, collapsed }) {
  const [hover, setHover] = useState(false);

  return (
    <Link to={item.path} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 12,
          padding: collapsed ? '12px 10px' : '12px 14px',
          marginBottom: 6,
          borderRadius: 14,
          background: isActive ? 'rgba(245, 166, 35, 0.15)' : hover ? 'rgba(255,255,255,0.05)' : 'transparent',
          border: isActive ? '1px solid rgba(245, 166, 35, 0.3)' : '1px solid transparent',
          color: isActive ? '#f5a623' : hover ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
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
          <span style={{ 
            fontSize: 18, 
            width: 20, 
            textAlign: 'center',
            filter: isActive ? 'drop-shadow(0 0 4px rgba(245,166,35,0.5))' : 'none'
          }}>
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
              background: '#f5a623',
              flexShrink: 0,
              boxShadow: '0 0 6px rgba(245, 166, 35, 0.6)',
            }}
          />
        )}
      </div>
    </Link>
  );
}

export default SidebarMenuItem;
