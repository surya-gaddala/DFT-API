// import React, { useState, useRef } from 'react';
// import { 
//   Typography, Paper, Box, Tabs, Tab, 
//   Table, TableBody, TableCell, TableContainer, 
//   TableHead, TableRow, IconButton, Tooltip,
//   Chip, Alert, AlertTitle, Slider, FormControlLabel,
//   Switch, ButtonGroup, Button
// } from '@mui/material';
// import { 
//   ContentCopy, 
//   Check, 
//   ZoomIn, 
//   ZoomOut, 
//   Height as HeightIcon,
//   Fullscreen,
//   FullscreenExit
// } from '@mui/icons-material';

// const ResponseDisplay = ({ response }) => {
//   const [activeTab, setActiveTab] = useState('body');
//   const [copied, setCopied] = useState(false);
//   const [fontSize, setFontSize] = useState(13);
//   const [height, setHeight] = useState(400);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [wordWrap, setWordWrap] = useState(true);
//   const containerRef = useRef(null);

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleZoom = (delta) => {
//     setFontSize(prev => Math.min(Math.max(prev + delta, 8), 24));
//   };

//   const handleHeightChange = (_, newValue) => {
//     setHeight(newValue);
//   };

//   const toggleFullscreen = () => {
//     if (!isFullscreen) {
//       if (containerRef.current?.requestFullscreen) {
//         containerRef.current.requestFullscreen();
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       }
//     }
//     setIsFullscreen(!isFullscreen);
//   };

//   if (!response) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height={200}>
//         <Typography variant="body1" color="text.secondary">
//           Send a request to see the response
//         </Typography>
//       </Box>
//     );
//   }

//   if (response.error) {
//     return (
//       <Alert severity="error" sx={{ mb: 2 }}>
//         <AlertTitle>Error {response.status && `(${response.status})`}</AlertTitle>
//         {response.error}
//         {response.response && (
//           <Box mt={2}>
//             <Typography variant="subtitle2" gutterBottom>
//               Server Response:
//             </Typography>
//             <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
//               <pre style={{ margin: 0 }}>{JSON.stringify(response.response, null, 2)}</pre>
//             </Paper>
//           </Box>
//         )}
//       </Alert>
//     );
//   }

//   const renderControls = () => (
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
//       <ButtonGroup size="small">
//         <Tooltip title="Zoom out">
//           <Button onClick={() => handleZoom(-1)}>
//             <ZoomOut fontSize="small" />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Zoom in">
//           <Button onClick={() => handleZoom(1)}>
//             <ZoomIn fontSize="small" />
//           </Button>
//         </Tooltip>
//       </ButtonGroup>
//       <FormControlLabel
//         control={
//           <Switch
//             size="small"
//             checked={wordWrap}
//             onChange={(e) => setWordWrap(e.target.checked)}
//           />
//         }
//         label="Word Wrap"
//       />
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
//         <HeightIcon fontSize="small" />
//         <Slider
//           size="small"
//           value={height}
//           min={200}
//           max={800}
//           onChange={handleHeightChange}
//           valueLabelDisplay="auto"
//           valueLabelFormat={(value) => `${value}px`}
//         />
//       </Box>
//       <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
//         <IconButton size="small" onClick={toggleFullscreen}>
//           {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
//         </IconButton>
//       </Tooltip>
//     </Box>
//   );

//   return (
//     <Box ref={containerRef}>
//       <Box display="flex" alignItems="center" gap={2} mb={2}>
//         <Chip 
//           label={`Status: ${response.status}`} 
//           color={
//             response.status >= 200 && response.status < 300 ? 'success' : 
//             response.status >= 400 ? 'error' : 'info'
//           }
//         />
//         <Tabs 
//           value={activeTab} 
//           onChange={(e, newValue) => setActiveTab(newValue)}
//           sx={{ flexGrow: 1 }}
//         >
//           <Tab label="Body" value="body" />
//           <Tab label="Headers" value="headers" />
//         </Tabs>
//         {activeTab === 'body' && (
//           <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
//             <IconButton onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}>
//               {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
//             </IconButton>
//           </Tooltip>
//         )}
//       </Box>

//       {renderControls()}

//       {activeTab === 'body' && (
//         <Paper 
//           elevation={2} 
//           sx={{ 
//             position: 'relative',
//             ...(isFullscreen && {
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 1300,
//               borderRadius: 0,
//             })
//           }}
//         >
//           <Box
//             sx={{
//               height: isFullscreen ? '100vh' : height,
//               overflow: 'auto',
//               p: 2,
//             }}
//           >
//             <pre style={{ 
//               margin: 0, 
//               fontFamily: 'monospace',
//               fontSize: `${fontSize}px`,
//               whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
//               wordWrap: wordWrap ? 'break-word' : 'normal',
//             }}>
//               {JSON.stringify(response.data, null, 2)}
//             </pre>
//           </Box>
//         </Paper>
//       )}

//       {activeTab === 'headers' && (
//         <Paper elevation={2}>
//           <Box sx={{ height: height, overflow: 'auto' }}>
//             <TableContainer>
//               <Table size="small" stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 'bold', fontSize: fontSize }}>Header</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold', fontSize: fontSize }}>Value</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(response.headers).map(([key, value]) => (
//                     <TableRow key={key}>
//                       <TableCell sx={{ fontSize: fontSize }}>{key}</TableCell>
//                       <TableCell sx={{ 
//                         fontSize: fontSize,
//                         whiteSpace: wordWrap ? 'normal' : 'nowrap',
//                       }}>
//                         {Array.isArray(value) ? value.join(', ') : value}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default ResponseDisplay;

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
 
const ResponseDisplay = ({ response }) => {
  const [activeTab, setActiveTab] = React.useState(0);
 
  if (!response) {
    return null;
  }
 
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
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
            <ContentCopyIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
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
            <Box
              sx={{
                position: 'sticky',
                left: 0,
                top: 0,
                bottom: 0,
                width: '28px',
                borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                color: 'rgba(0, 0, 0, 0.3)',
                fontSize: '11px',
                fontFamily: 'monospace',
                textAlign: 'right',
                paddingRight: '4px',
                paddingTop: '4px',
                userSelect: 'none',
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                zIndex: 1
              }}
            >
              {formatResponse(response.data).split('\n').map((_, i) => (
                <div key={i} style={{ height: '18px', lineHeight: '18px' }}>{i + 1}</div>
              ))}
            </Box>
          )}
          
          <Box sx={{ 
            pl: activeTab === 0 ? '28px' : '8px', 
            pr: '8px',
            pt: '4px',
            pb: '4px'
          }}>
            <pre style={{
              margin: 0,
              color: 'black',
              fontSize: '12px',
              fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
              lineHeight: '18px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {activeTab === 0
                ? formatResponse(response.data)
                : formatResponse(response.headers)
              }
            </pre>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
 
export default ResponseDisplay;