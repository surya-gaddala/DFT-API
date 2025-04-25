import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Paper, Tooltip } from '@mui/material';
import { theme } from './theme';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceHeader from './components/layout/WorkspaceHeader';
import RequestForm from './components/RequestForm';
import ResponseDisplay from './components/ResponseDisplay';
import ViewManager from './components/viewers/ViewManager';

// Default panel widths
const DEFAULT_LEFT_WIDTH = 160;
const DEFAULT_MIDDLE_WIDTH = 320;
const MIN_MIDDLE_WIDTH = 160;
const MAX_MIDDLE_WIDTH = 500;

function App() {
  const [response, setResponse] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedView, setSelectedView] = useState('collections');
  const [isMiddlePanelOpen, setIsMiddlePanelOpen] = useState(true);
  const [middleWidth, setMiddleWidth] = useState(DEFAULT_MIDDLE_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  
  const middleResizeRef = useRef(null);

  const handleResponse = (responseData, requestConfig) => {
    setResponse(responseData);
    if (requestConfig) {
      const newRequest = {
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        body: requestConfig.data || '',
        timestamp: new Date().toISOString(),
        id: Date.now(),
        response: responseData
      };
      setCurrentRequest(newRequest);
      setHistory(prev => [newRequest, ...prev].slice(0, 50));
    }
  };

  const refreshCollections = () => {
    setRefreshKey(prev => prev + 1);
    // Ensure middle panel is open and showing collections view when a new request is saved
    setSelectedView('collections');
    setIsMiddlePanelOpen(true);
  };

  const handleSelectRequest = (request) => {
    setCurrentRequest(request);
    if (request.response) {
      setResponse(request.response);
    }
    // Ensure middle panel stays open when loading a request
    setIsMiddlePanelOpen(true);
  };

  const handleViewChange = (view) => {
    if (selectedView === view) {
      // Toggle the middle panel when clicking the same menu item
      setIsMiddlePanelOpen(!isMiddlePanelOpen);
    } else {
      // Open the middle panel and change the view when clicking a different menu item
      setSelectedView(view);
      setIsMiddlePanelOpen(true);
    }
  };

  const resetMiddlePanelWidth = () => {
    setMiddleWidth(DEFAULT_MIDDLE_WIDTH);
  };

  const initResize = (ref) => {
    const startResize = (e) => {
      e.preventDefault();
      setIsResizing(true);
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
    };

    const resize = (e) => {
      requestAnimationFrame(() => {
        const newWidth = e.clientX - DEFAULT_LEFT_WIDTH;
        if (newWidth >= MIN_MIDDLE_WIDTH && newWidth <= MAX_MIDDLE_WIDTH) {
          setMiddleWidth(newWidth);
        }
      });
    };

    const stopResize = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };

    const handleDoubleClick = () => {
      resetMiddlePanelWidth();
    };

    ref.current?.addEventListener('mousedown', startResize);
    ref.current?.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      ref.current?.removeEventListener('mousedown', startResize);
      ref.current?.removeEventListener('dblclick', handleDoubleClick);
    };
  };

  useEffect(() => {
    const middleCleanup = initResize(middleResizeRef);
    return () => {
      middleCleanup();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        bgcolor: 'background.default',
        userSelect: isResizing ? 'none' : 'auto'
      }}>
        <Header />
        <WorkspaceHeader onImportSuccess={refreshCollections} />
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1, 
          overflow: 'hidden',
          position: 'relative',
          gap: 0.5,
          px: 0.5,
          pt: 0.5
        }}>
          {/* Navigation Sidebar - Fixed width */}
          <Paper
            elevation={0}
            sx={{ 
              width: DEFAULT_LEFT_WIDTH,
              flexShrink: 0, 
              borderRight: 1,
              borderColor: isMiddlePanelOpen ? 'primary.main' : 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 2,
              borderRadius: 0.5
            }}
          >
            <Sidebar 
              refreshKey={refreshKey}
              history={history}
              onSelectRequest={handleSelectRequest}
              selectedView={selectedView}
              onViewChange={handleViewChange}
            />
          </Paper>

          {/* View Manager - Collapsible & Resizable */}
          <Paper
            elevation={0}
            sx={{
              width: isMiddlePanelOpen ? middleWidth : 0,
              flexShrink: 0,
              borderRight: 1,
              borderColor: isMiddlePanelOpen ? 'primary.main' : 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 1,
              ml: 0.5,
              borderRadius: 0.5,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <ViewManager 
                selectedView={selectedView}
                onSelectRequest={handleSelectRequest}
                refreshKey={refreshKey}
              />
            </Box>
            {isMiddlePanelOpen && (
              <Tooltip title="Double-click to reset width" placement="right">
                <Box
                  ref={middleResizeRef}
                  sx={{
                    position: 'absolute',
                    right: -6,
                    top: 0,
                    bottom: 0,
                    width: 12,
                    cursor: 'col-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: 4,
                      height: '100%',
                      bgcolor: 'divider',
                      opacity: 0
                    },
                    '&:hover::after': {
                      opacity: 0.8,
                      bgcolor: 'primary.main'
                    },
                    '&:active::after': {
                      opacity: 1,
                      bgcolor: 'primary.dark'
                    }
                  }}
                />
              </Tooltip>
            )}
          </Paper>

          {/* Main Content Area - Flexible width */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            ml: 0.5
          }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5,
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                position: 'relative',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <RequestForm 
                onResponse={handleResponse}
                initialRequest={currentRequest}
                onSaveSuccess={refreshCollections}
              />
            </Paper>
            {response && (
              <ResponseDisplay response={response} />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;