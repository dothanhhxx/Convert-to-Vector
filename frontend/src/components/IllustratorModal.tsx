import React from 'react';
import { Modal, Typography, Steps, Tabs, Alert, Tag } from 'antd';
import {
  FolderOpenOutlined,
  SelectOutlined,
  BgColorsOutlined,
  SaveOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface IllustratorModalProps {
  open: boolean;
  onClose: () => void;
}

export const IllustratorModal: React.FC<IllustratorModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: 18 }}>
            Adobe Illustrator Workflow Guide
          </span>
          <Tag color="blue" style={{ fontWeight: 600 }}>Vector Editing</Tag>
        </div>
      }
      open={open}
      onOk={onClose}
      onCancel={onClose}
      width={720}
      footer={[
        <button
          key="close"
          className="ant-btn ant-btn-primary"
          onClick={onClose}
          style={{ fontWeight: 600 }}
        >
          Got It, Start Vectorizing
        </button>,
      ]}
    >
      <Alert
        message="100% Genuine Vector Paths & Bézier Splines"
        description="All files exported from Vector Studio (SVG, PDF, EPS, and AI) contain true mathematical vectors—never embedded raster pixels. You can zoom infinitely without any pixelation or quality loss."
        type="info"
        showIcon
        icon={<BulbOutlined />}
        style={{ marginBottom: 20 }}
      />

      <Tabs
        defaultActiveKey="stepbystep"
        items={[
          {
            key: 'stepbystep',
            label: 'Step-by-Step Guide',
            children: (
              <Steps
                direction="vertical"
                size="small"
                current={-1}
                items={[
                  {
                    title: <span style={{ fontWeight: 600, color: '#f1f5f9' }}>1. Open the File in Illustrator</span>,
                    description: (
                      <Paragraph style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                        Launch Adobe Illustrator. Go to <Text code>File &gt; Open</Text> (<Text keyboard>Ctrl+O</Text> / <Text keyboard>Cmd+O</Text>) and choose your exported <Text strong style={{ color: '#f1f5f9' }}>.svg</Text>, <Text strong style={{ color: '#f1f5f9' }}>.pdf</Text>, <Text strong style={{ color: '#f1f5f9' }}>.eps</Text>, or <Text strong style={{ color: '#f1f5f9' }}>.ai</Text> file. All formats open immediately with preserved vector paths.
                      </Paragraph>
                    ),
                    icon: <FolderOpenOutlined style={{ color: '#3b82f6' }} />,
                  },
                  {
                    title: <span style={{ fontWeight: 600, color: '#f1f5f9' }}>2. Ungroup Shapes & Paths</span>,
                    description: (
                      <Paragraph style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                        Select the graphic with the Selection Tool (<Text keyboard>V</Text>). Press <Text keyboard>Ctrl+Shift+G</Text> (<Text keyboard>Cmd+Shift+G</Text>) or right-click and choose <Text strong style={{ color: '#f1f5f9' }}>Ungroup</Text>. Repeat once or twice until you can click on individual vector shapes.
                      </Paragraph>
                    ),
                    icon: <SelectOutlined style={{ color: '#10b981' }} />,
                  },
                  {
                    title: <span style={{ fontWeight: 600, color: '#f1f5f9' }}>3. Inspect & Edit Anchor Points</span>,
                    description: (
                      <Paragraph style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                        Switch to the <Text strong style={{ color: '#f1f5f9' }}>Direct Selection Tool</Text> by pressing <Text keyboard>A</Text>. Click on any curve to reveal its anchor points and directional Bézier handles. Drag any handle to reshape curves smoothly.
                      </Paragraph>
                    ),
                    icon: <BgColorsOutlined style={{ color: '#f59e0b' }} />,
                  },
                  {
                    title: <span style={{ fontWeight: 600, color: '#f1f5f9' }}>4. Recolor or Organize Layers</span>,
                    description: (
                      <Paragraph style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
                        Open the Swatches panel (<Text code>Window &gt; Swatches</Text>) to change fills or strokes. Use <Text code>Edit &gt; Edit Colors &gt; Recolor Artwork</Text> to dynamically adjust the entire palette.
                      </Paragraph>
                    ),
                    icon: <SaveOutlined style={{ color: '#8b5cf6' }} />,
                  },
                ]}
              />
            ),
          },
          {
            key: 'shortcuts',
            label: 'Essential Illustrator Shortcuts',
            children: (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <div className="shortcut-card">
                  <Text keyboard>V</Text>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, marginLeft: 8 }}>Selection Tool</span>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Select and move entire objects or groups</div>
                </div>
                <div className="shortcut-card">
                  <Text keyboard>A</Text>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, marginLeft: 8 }}>Direct Selection Tool</span>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Select anchor points and manipulate Bézier handles</div>
                </div>
                <div className="shortcut-card">
                  <Text keyboard>Ctrl+Shift+G</Text>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, marginLeft: 8 }}>Ungroup</span>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Break compound groups into individual editable shapes</div>
                </div>
                <div className="shortcut-card">
                  <Text keyboard>Ctrl+Y</Text>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, marginLeft: 8 }}>Outline View</span>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Toggle wireframe mode to inspect raw vector geometry</div>
                </div>
                <div className="shortcut-card">
                  <Text keyboard>P</Text>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, marginLeft: 8 }}>Pen Tool</span>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Add or remove anchor points on existing vector paths</div>
                </div>
                <div className="shortcut-card">
                  <Text keyboard>Shift+C</Text>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, marginLeft: 8 }}>Anchor Point Tool</span>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Convert between sharp corners and smooth curves</div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};
