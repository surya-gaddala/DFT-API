import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { importCollection } from '../../utils/dataManager';

const WorkspaceHeader = ({ onImportSuccess }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [urlType, setUrlType] = useState('swagger'); // 'swagger' or 'curl'
  const fileInputRef = useRef(null);

  const handleImportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUrlDialogClose = () => {
    setUrlDialogOpen(false);
    setImportUrl('');
  };

  const handleUrlImport = async () => {
    if (!importUrl) return;

    try {
      const response = await fetch(importUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      let collectionData;

      if (urlType === 'swagger') {
        try {
          const swaggerData = JSON.parse(content);
          collectionData = convertSwaggerToCollection(swaggerData, importUrl);
        } catch (error) {
          console.error('Error parsing Swagger URL:', error);
          alert('Invalid Swagger format from URL');
          return;
        }
      } else {
        collectionData = convertCurlToCollection(content, importUrl);
      }

      try {
        await importCollection(collectionData);
        if (onImportSuccess) {
          onImportSuccess();
        }
        alert('Collection imported successfully!');
      } catch (error) {
        console.error('Error importing collection:', error);
        alert('Failed to import collection: ' + error.message);
      }
    } catch (error) {
      console.error('Error fetching URL:', error);
      alert('Error fetching URL: ' + error.message);
    }

    handleUrlDialogClose();
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        let collectionData;

        if (file.name.endsWith('.json')) {
          // Handle Swagger/OpenAPI
          try {
            const swaggerData = JSON.parse(content);
            collectionData = convertSwaggerToCollection(swaggerData, file.name);
          } catch (error) {
            console.error('Error parsing Swagger file:', error);
            alert('Invalid Swagger file format');
            return;
          }
        } else if (file.name.endsWith('.txt') || file.name.endsWith('.curl')) {
          // Handle cURL
          collectionData = convertCurlToCollection(content, file.name);
        } else {
          alert('Unsupported file format. Please use .json (Swagger) or .txt/.curl (cURL) files.');
          return;
        }

        try {
          await importCollection(collectionData);
          if (onImportSuccess) {
            onImportSuccess();
          }
          alert('Collection imported successfully!');
        } catch (error) {
          console.error('Error importing collection:', error);
          alert('Failed to import collection: ' + error.message);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file: ' + error.message);
    }

    // Reset file input
    event.target.value = '';
  };

  const convertSwaggerToCollection = (swaggerData, source) => {
    const collectionName = source.split('/').pop().replace('.json', '');
    const requests = [];

    // Extract paths and methods from Swagger
    if (swaggerData.paths) {
      Object.entries(swaggerData.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, details]) => {
          const request = {
            name: details.summary || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            url: `${swaggerData.servers?.[0]?.url || ''}${path}`,
            headers: {
              'Content-Type': 'application/json'
            },
            body: details.requestBody ? JSON.stringify(details.requestBody.content['application/json'].schema, null, 2) : ''
          };
          requests.push(request);
        });
      });
    }

    return {
      name: collectionName,
      description: swaggerData.info?.description || `Imported from ${source}`,
      requests
    };
  };

  const convertCurlToCollection = (curlContent, source) => {
    const collectionName = source.split('/').pop().replace(/\.(txt|curl)$/, '');
    const requests = [];

    // Split multiple cURL commands if present
    const curlCommands = curlContent.split('\n\n').filter(cmd => cmd.trim().startsWith('curl'));

    curlCommands.forEach((curlCommand, index) => {
      const method = curlCommand.match(/-X\s+(\w+)/i)?.[1]?.toUpperCase() || 'GET';
      const url = curlCommand.match(/curl\s+['"]([^'"]+)['"]/)?.[1] || 
                 curlCommand.match(/curl\s+([^\s]+)/)?.[1] || '';
      
      const headers = {};
      const headerMatches = curlCommand.matchAll(/-H\s+['"]([^'"]+)['"]/g);
      for (const match of headerMatches) {
        const [key, value] = match[1].split(': ');
        headers[key] = value;
      }

      const body = curlCommand.match(/-d\s+['"]([^'"]+)['"]/)?.[1] || '';

      requests.push({
        name: `Request ${index + 1}`,
        method,
        url,
        headers,
        body
      });
    });

    return {
      name: collectionName,
      description: `Imported from ${source}`,
      requests
    };
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', py: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Workspace</Typography>
        <Button 
          size="small" 
          startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
          sx={{ fontSize: '0.75rem', py: 0.5 }}
        >
          New
        </Button>
        <Button 
          size="small"
          onClick={handleImportClick}
          sx={{ fontSize: '0.75rem', py: 0.5 }}
        >
          Import
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json,.txt,.curl"
          onChange={handleFileInputChange}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: '160px',
              '& .MuiMenuItem-root': {
                fontSize: '0.75rem',
                py: 0.5
              }
            }
          }}
          transitionDuration={0}
        >
          <MenuItem onClick={() => {
            fileInputRef.current.click();
            handleMenuClose();
          }}>
            Import from File
          </MenuItem>
          <MenuItem onClick={() => {
            setUrlType('swagger');
            setUrlDialogOpen(true);
            handleMenuClose();
          }}>
            Import Swagger from URL
          </MenuItem>
          <MenuItem onClick={() => {
            setUrlType('curl');
            setUrlDialogOpen(true);
            handleMenuClose();
          }}>
            Import cURL from URL
          </MenuItem>
        </Menu>
        <Dialog 
          open={urlDialogOpen} 
          onClose={handleUrlDialogClose}
          PaperProps={{
            sx: {
              minWidth: '400px',
              '& .MuiDialogTitle-root': {
                fontSize: '0.875rem',
                py: 1
              },
              '& .MuiDialogContent-root': {
                py: 1
              },
              '& .MuiDialogActions-root': {
                py: 1
              }
            }
          }}
          transitionDuration={0}
        >
          <DialogTitle>
            Import {urlType === 'swagger' ? 'Swagger' : 'cURL'} from URL
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="URL"
              type="url"
              fullWidth
              variant="outlined"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder={`Enter ${urlType === 'swagger' ? 'Swagger' : 'cURL'} URL`}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '0.75rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.75rem'
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleUrlDialogClose}
              sx={{ fontSize: '0.75rem' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUrlImport} 
              variant="contained" 
              disabled={!importUrl}
              sx={{ fontSize: '0.75rem' }}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default WorkspaceHeader; 