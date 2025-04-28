import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  WrapText as WrapTextIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const ResponseDisplay = ({ response }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!response) {
    return null;
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatResponse = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#4CAF50';
    if (status >= 300 && status < 400) return '#2196F3';
    if (status >= 400 && status < 500) return '#FF9800';
    return '#f44336';
  };

  const formatSize = (bytes) => {
    if (bytes === undefined || bytes === null) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  if (response.error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error {response.status && `(${response.status})`}</AlertTitle>
        {response.error}
        {response.response && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Server Response:
            </Typography>
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
              <pre style={{ margin: 0 }}>{JSON.stringify(response.response, null, 2)}</pre>
            </Paper>
          </Box>
        )}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      mt: 0.5,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '200px',
      maxHeight: 'calc(100vh - 300px)',
      position: 'relative',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      borderRadius: 1,
      resize: 'vertical',
      overflow: 'auto',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '15px',
        height: '15px',
        cursor: 'nwse-resize',
        background: `
          linear-gradient(
            135deg,
            transparent 0%,
            transparent 50%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.1) 100%
          )
        `
      },
      '&:hover::after': {
        background: `
          linear-gradient(
            135deg,
            transparent 0%,
            transparent 50%,
            rgba(0,0,0,0.2) 50%,
            rgba(0,0,0,0.2) 100%
          )
        `
      }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: '4px 8px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        flexShrink: 0,
        bgcolor: 'rgba(0, 0, 0, 0.02)'
      }}>
        <Typography
          variant="body2"
          sx={{
            color: getStatusColor(response.status),
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: getStatusColor(response.status),
            display: 'inline-block'
          }}></span>
          Status: {response.status} {response.statusText}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Time: {new Date(response.time).toLocaleTimeString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Request: {formatSize(response.requestSize)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Response: {formatSize(response.responseSize)}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
              />
            }
            label={<WrapTextIcon fontSize="small" />}
          />
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton size="small" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          minHeight: '32px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          flexShrink: 0,
          '& .MuiTab-root': {
            minHeight: '28px',
            padding: '4px 12px',
            textTransform: 'none',
            fontSize: '0.75rem'
          }
        }}
      >
        <Tab label="Body" />
        <Tab label="Headers" />
      </Tabs>

      <Paper
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: '150px',
          borderRadius: 0
        }}
      >
        <Box sx={{
          position: 'absolute',
          right: 4,
          top: 4,
          zIndex: 2
        }}>
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
            <IconButton
              size="small"
              onClick={() => handleCopy(
                activeTab === 0
                  ? formatResponse(response.data)
                  : formatResponse(response.headers)
              )}
              sx={{
                padding: '2px',
                color: 'rgba(0, 0, 0, 0.7)',
                '&:hover': {
                  color: 'black',
                  bgcolor: 'rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              {copied ? <CheckIcon sx={{ fontSize: '1rem' }} /> : <CopyIcon sx={{ fontSize: '1rem' }} />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            position: 'relative',
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(0, 0, 0, 0.3)'
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent'
            }
          }}
        >
          {activeTab === 0 && (
            <Box sx={{ 
              p: 2,
              color: '#000000',
              fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              wordBreak: wordWrap ? 'break-word' : 'normal'
            }}>
              <pre style={{ margin: 0 }}>{formatResponse(response.data)}</pre>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ 
              p: 2,
              color: '#000000',
              fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              wordBreak: wordWrap ? 'break-word' : 'normal'
            }}>
              <pre style={{ margin: 0 }}>{formatResponse(response.headers)}</pre>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResponseDisplay;