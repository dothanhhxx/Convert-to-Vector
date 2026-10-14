import React from 'react';
import {
  Form,
  Segmented,
  Slider,
  Switch,
  Button,
  Collapse,
  Space,
  Typography,
  Tooltip,
  Divider,
} from 'antd';
import {
  ThunderboltOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  UndoOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import type {
  VectorSettings,
  AlgorithmType,
  ColorModeType,
  DetailLevelType,
  HierarchicalType,
  CurveModeType,
  ImageMetadata,
} from '../types/vector';

const { Text, Title } = Typography;

interface SidebarProps {
  settings: VectorSettings;
  onChangeSettings: (newSettings: VectorSettings) => void;
  onConvert: () => void;
  onResetSettings: () => void;
  isProcessing: boolean;
  metadata: ImageMetadata | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  onChangeSettings,
  onConvert,
  onResetSettings,
  isProcessing,
  metadata,
}) => {
  const updateSetting = <K extends keyof VectorSettings>(key: K, value: VectorSettings[K]) => {
    onChangeSettings({ ...settings, [key]: value });
  };

  const isBinaryMode = settings.colorMode === 'binary' || settings.algorithm === 'potrace';

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <Space orientation="horizontal" size="small">
          <ControlOutlined style={{ fontSize: 16, color: '#3b82f6' }} />
          <Title level={5} style={{ margin: 0, fontWeight: 600, color: '#f1f5f9' }}>
            Vector Settings
          </Title>
        </Space>
        {metadata && (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {metadata.width}×{metadata.height} px
          </span>
        )}
      </div>

      <div className="sidebar-scrollable">
        <Form layout="vertical" size="small">
          {/* Algorithm Engine */}
          <Form.Item
            label={
              <Space orientation="horizontal" size="small">
                <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Engine Algorithm</Text>
                <Tooltip title="VTracer supports full multi-color and multi-layer vectorization. Potrace delivers ultra-crisp black & white silhouettes.">
                  <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                </Tooltip>
              </Space>
            }
          >
            <Segmented<AlgorithmType>
              block
              value={settings.algorithm}
              onChange={(val) => {
                updateSetting('algorithm', val);
                if (val === 'potrace') {
                  updateSetting('colorMode', 'binary');
                }
              }}
              options={[
                { label: 'VTracer (Color)', value: 'vtracer' },
                { label: 'Potrace (B&W)', value: 'potrace' },
              ]}
            />
          </Form.Item>

          {/* Color Mode */}
          <Form.Item
            label={
              <Space orientation="horizontal" size="small">
                <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Color Mode</Text>
                <Tooltip title="Choose how colors are categorized and extracted.">
                  <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                </Tooltip>
              </Space>
            }
          >
            <Segmented<ColorModeType>
              block
              value={settings.colorMode}
              disabled={settings.algorithm === 'potrace'}
              onChange={(val) => updateSetting('colorMode', val)}
              options={[
                { label: 'Color', value: 'color' },
                { label: 'Grayscale', value: 'grayscale' },
                { label: 'B&W', value: 'binary' },
              ]}
            />
          </Form.Item>

          {/* Number of Colors (Visible when not in pure B&W mode) */}
          {!isBinaryMode && (
            <Form.Item
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Space orientation="horizontal" size="small">
                    <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Number of Colors</Text>
                    <Tooltip title="Quantizes the image into distinct color swatches. Fewer colors produce cleaner, minimalist flat vector art.">
                      <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                    </Tooltip>
                  </Space>
                  <Text style={{ fontWeight: 600, color: '#3b82f6' }}>{settings.numColors} colors</Text>
                </div>
              }
            >
              <Slider
                min={2}
                max={48}
                value={settings.numColors}
                onChange={(val) => updateSetting('numColors', val)}
                marks={{
                  2: '2',
                  8: '8',
                  16: '16',
                  32: '32',
                  48: '48',
                }}
              />
            </Form.Item>
          )}

          {/* Threshold (Only in B&W / Binary mode) */}
          {isBinaryMode && (
            <Form.Item
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Space orientation="horizontal" size="small">
                    <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>B&W Threshold</Text>
                    <Tooltip title="Adjusts the brightness cutoff dividing foreground vectors from background.">
                      <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                    </Tooltip>
                  </Space>
                  <Text style={{ fontWeight: 600, color: '#3b82f6' }}>{settings.threshold}</Text>
                </div>
              }
            >
              <Slider
                min={10}
                max={245}
                value={settings.threshold}
                onChange={(val) => updateSetting('threshold', val)}
              />
            </Form.Item>
          )}

          {/* Detail Level */}
          <Form.Item
            label={
              <Space orientation="horizontal" size="small">
                <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Detail Level</Text>
                <Tooltip title="Controls path fidelity and anchor node density.">
                  <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                </Tooltip>
              </Space>
            }
          >
            <Segmented<DetailLevelType>
              block
              value={settings.detailLevel}
              onChange={(val) => updateSetting('detailLevel', val)}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Ultra', value: 'ultra' },
              ]}
            />
          </Form.Item>

          {/* Smoothing / Corner Threshold */}
          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Space orientation="horizontal" size="small">
                  <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Curve Smoothing</Text>
                  <Tooltip title="Smoothes sharp corners into fluid Bézier curves. Higher values produce rounder shapes.">
                    <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                  </Tooltip>
                </Space>
                <Text style={{ fontWeight: 400, color: '#94a3b8' }}>{settings.cornerThreshold}°</Text>
              </div>
            }
          >
            <Slider
              min={10}
              max={150}
              value={settings.cornerThreshold}
              onChange={(val) => updateSetting('cornerThreshold', val)}
            />
          </Form.Item>

          {/* Noise Reduction */}
          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Space orientation="horizontal" size="small">
                  <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Noise Reduction</Text>
                  <Tooltip title="Filters out small stray speckles, dust, and scan artifacts.">
                    <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                  </Tooltip>
                </Space>
                <Text style={{ fontWeight: 400, color: '#94a3b8' }}>
                  {settings.noiseReduction === 0 ? 'Off' : `Level ${settings.noiseReduction}`}
                </Text>
              </div>
            }
          >
            <Slider
              min={0}
              max={8}
              value={settings.noiseReduction}
              onChange={(val) => updateSetting('noiseReduction', val)}
            />
          </Form.Item>

          {/* Background Removal */}
          <div className="setting-toggle-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Remove Background</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Make detected solid background transparent
                </div>
              </div>
              <Switch
                checked={settings.removeBackground}
                onChange={(checked) => updateSetting('removeBackground', checked)}
              />
            </div>

            {settings.removeBackground && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>Tolerance</Text>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>
                    {settings.bgTolerance}%
                  </Text>
                </div>
                <Slider
                  min={5}
                  max={70}
                  value={settings.bgTolerance}
                  onChange={(val) => updateSetting('bgTolerance', val)}
                />
              </div>
            )}
          </div>

          <Divider style={{ margin: '12px 0', borderColor: '#283347' }} />

          {/* Advanced Fine-Tuning */}
          <Collapse
            ghost
            items={[
              {
                key: 'advanced',
                label: (
                  <Space orientation="horizontal" size="small">
                    <SettingOutlined style={{ color: '#94a3b8' }} />
                    <Text style={{ fontWeight: 600, color: '#94a3b8' }}>Advanced Path Options</Text>
                  </Space>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <Text style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                        Curve Geometry
                      </Text>
                      <Segmented<CurveModeType>
                        block
                        style={{ marginTop: 4 }}
                        value={settings.curveMode}
                        onChange={(val) => updateSetting('curveMode', val)}
                        options={[
                          { label: 'Spline (Curves)', value: 'spline' },
                          { label: 'Polygon (Lines)', value: 'polygon' },
                        ]}
                      />
                    </div>

                    <div>
                      <Text style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                        Layer Stacking
                      </Text>
                      <Segmented<HierarchicalType>
                        block
                        style={{ marginTop: 4 }}
                        value={settings.hierarchical}
                        onChange={(val) => updateSetting('hierarchical', val)}
                        options={[
                          { label: 'Stacked (Solid)', value: 'stacked' },
                          { label: 'Cutout (Hollow)', value: 'cutout' },
                        ]}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#94a3b8' }}>Filter Speckle</Text>
                        <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                          {settings.filterSpeckle} px
                        </Text>
                      </div>
                      <Slider
                        min={1}
                        max={16}
                        value={settings.filterSpeckle}
                        onChange={(val) => updateSetting('filterSpeckle', val)}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </div>

      <div className="sidebar-footer">
        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={onConvert}
          loading={isProcessing}
          block
          style={{ height: 46, fontWeight: 600, fontSize: 15 }}
        >
          {isProcessing ? 'Vectorizing Artwork...' : 'Convert to Vector'}
        </Button>

        <Button
          icon={<UndoOutlined />}
          onClick={onResetSettings}
          block
          style={{ marginTop: 8, fontWeight: 400, color: '#94a3b8' }}
        >
          Reset Parameters
        </Button>
      </div>
    </aside>
  );
};
