import React from 'react';
import { Space, Button, Dropdown, Tag } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { SampleImage } from '../types/vector';

interface HeaderProps {
  samples: SampleImage[];
  onSelectSample: (sample: SampleImage) => void;
  onReset: () => void;
  onOpenGuide: () => void;
  hasImage: boolean;
  isProcessing: boolean;
  hasVector: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  samples,
  onSelectSample,
  onReset,
  onOpenGuide,
  hasImage,
  isProcessing,
  hasVector,
}) => {
  const sampleMenuItems: MenuProps['items'] = samples.map((sample) => ({
    key: sample.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
        <img
          src={sample.preview}
          alt={sample.title}
          style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4, background: '#1e293b' }}
        />
        <div>
          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{sample.title}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {sample.width}×{sample.height} • {sample.sizeFormatted}
          </div>
        </div>
      </div>
    ),
    onClick: () => onSelectSample(sample),
  }));

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#2563EB" />
            <path
              d="M7 21L14 7L21 21M9.5 16.5H18.5"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="7" r="2" fill="#60A5FA" />
            <circle cx="7" cy="21" r="2" fill="#60A5FA" />
            <circle cx="21" cy="21" r="2" fill="#60A5FA" />
          </svg>
          <div className="brand-title-group">
            <span className="brand-title">Vector Studio</span>
            <span className="brand-subtitle">AI & Illustrator Vectorizer</span>
          </div>
        </div>

        <Tag color="blue" style={{ marginLeft: 8, fontWeight: 600, border: 'none' }}>
          SVG • PDF • EPS • AI
        </Tag>
      </div>

      <div className="header-center">
        {isProcessing ? (
          <Tag icon={<SyncOutlined spin />} color="processing" style={{ fontWeight: 600 }}>
            Tracing Vectors...
          </Tag>
        ) : hasVector ? (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontWeight: 600 }}>
            Vector Ready
          </Tag>
        ) : hasImage ? (
          <Tag color="default" style={{ fontWeight: 400 }}>
            Image Loaded
          </Tag>
        ) : null}
      </div>

      <div className="header-right">
        <Space orientation="horizontal" size="middle">
          {samples.length > 0 && (
            <Dropdown menu={{ items: sampleMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button icon={<AppstoreOutlined />} style={{ fontWeight: 600 }}>
                Try Sample <FolderOpenOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
              </Button>
            </Dropdown>
          )}

          <Button icon={<QuestionCircleOutlined />} onClick={onOpenGuide} style={{ fontWeight: 600 }}>
            Illustrator Guide
          </Button>

          {hasImage && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              danger
              style={{ fontWeight: 600 }}
            >
              New Project
            </Button>
          )}
        </Space>
      </div>
    </header>
  );
};
