import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Select, MenuItem, 
  FormControl, InputLabel, Tabs, Tab, 
  Box, IconButton, Tooltip, Paper, Divider,
  Typography, Menu
} from '@mui/material';
import { 
  Add, Delete, ContentCopy, Send,
  Code, Settings
} from '@mui/icons-material';
import axios from 'axios';
import { saveCollection, getCollections, createCollection } from '../utils/collectionManager';
import RequestTabs from './RequestTabs';

// Define HTTP methods with their properties
const HTTP_METHODS = {
  GET: {
    color: '#61affe',
    requiresBody: false,
    description: 'Retrieve data from a specified resource'
  },
  POST: {
    color: '#49cc90',
    requiresBody: true,
    description: 'Submit data to be processed to a specified resource'
  },
  PUT: {
    color: '#fca130',
    requiresBody: true,
    description: 'Update a specified resource with new data'
  },
  PATCH: {
    color: '#50e3c2',
    requiresBody: true,
    description: 'Partially update a specified resource'
  },
  DELETE: {
    color: '#f93e3e',
    requiresBody: false,
    description: 'Delete a specified resource'
  },
  HEAD: {
    color: '#9012fe',
    requiresBody: false,
    description: 'Same as GET but returns only headers, no body'
  }
};

const getMethodBodyTemplate = (method) => {
  switch (method) {
    case 'POST':
      return JSON.stringify({
        title: 'New Resource',
        body: 'Resource content',
        userId: 1
      }, null, 2);
    case 'PUT':
      return JSON.stringify({
        id: 1,
        title: 'Updated Resource',
        body: 'Updated content',
        userId: 1
      }, null, 2);
    case 'PATCH':
      return JSON.stringify({
        title: 'Updated Title'
      }, null, 2);
    default:
      return '';
  }
};

// Create axios instance with better CORS and error handling
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  // Add default timeout
  timeout: 30000,
  // Add withCredentials for CORS requests if needed
  withCredentials: false
});

// Add request interceptor for URL handling
api.interceptors.request.use(
  config => {
    // Handle URLs that don't start with http(s)
    if (!/^https?:\/\//i.test(config.url)) {
      config.url = `https://${config.url}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor with better error handling
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle CORS errors
    if (error.message === 'Network Error' || error.response?.status === 0) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Try different CORS proxies in order
        const proxies = [
          'https://api.allorigins.win/raw?url=',
          'https://api.codetabs.com/v1/proxy?quest=',
          'https://cors-anywhere.herokuapp.com/'
        ];

        for (const proxy of proxies) {
          try {
            const proxyUrl = proxy + originalRequest.url;
            const response = await axios({
              ...originalRequest,
              url: proxyUrl
            });
            return response;
          } catch (proxyError) {
            console.log(`Proxy ${proxy} failed, trying next...`);
            continue;
          }
        }
      }
    }

    // Handle specific error types
    if (error.response) {
      // Server responded with error status
      return Promise.reject({
        ...error,
        message: `Server responded with error ${error.response.status}: ${error.response.statusText}`
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        ...error,
        message: 'No response received from server. This might be due to CORS restrictions or network issues.'
      });
    } else {
      // Error in request setup
      return Promise.reject({
        ...error,
        message: 'Error setting up the request. Please check your input and try again.'
      });
    }
  }
);

const RequestForm = ({ onResponse, initialRequest, onSaveSuccess }) => {
  const [method, setMethod] = useState(initialRequest?.method || 'GET');
  const [url, setUrl] = useState(initialRequest?.url || '');
  const [activeTab, setActiveTab] = useState(0);
  const [headers, setHeaders] = useState(initialRequest?.headers || {
    'Content-Type': 'application/json'
  });
  const [body, setBody] = useState(
    typeof initialRequest?.body === 'string' 
      ? initialRequest.body 
      : initialRequest?.body 
        ? JSON.stringify(initialRequest.body, null, 2)
        : ''
  );
  const [collectionName, setCollectionName] = useState('');
  const [requestName, setRequestName] = useState(initialRequest?.name || '');
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Update form when initialRequest changes
  useEffect(() => {
    if (initialRequest) {
      setMethod(initialRequest.method || 'GET');
      setUrl(initialRequest.url || '');
      setHeaders(initialRequest.headers || { 'Content-Type': 'application/json' });
      // Ensure body is converted to string if it's an object
      setBody(
        typeof initialRequest.body === 'string'
          ? initialRequest.body
          : initialRequest.body
            ? JSON.stringify(initialRequest.body, null, 2)
            : ''
      );
      setRequestName(initialRequest.name || '');
      setCollectionName(initialRequest.collectionName || '');
      
      // If the request has a body, switch to the body tab
      if (initialRequest.body) {
        setActiveTab(2);
      }
    }
  }, [initialRequest]);

  useEffect(() => {
    // Load collections when component mounts or when refreshKey changes
    const data = getCollections();
    setCollections(data.collections);
  }, [onSaveSuccess]); // Add onSaveSuccess to dependencies to ensure we update when parent triggers refresh

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    if (HTTP_METHODS[newMethod].requiresBody && !body) {
      setBody(getMethodBodyTemplate(newMethod));
      setActiveTab(2); // Switch to body tab
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let requestBody = body;
      // Parse body if it's a string and method requires body
      if (HTTP_METHODS[method].requiresBody && typeof body === 'string' && body.trim()) {
        try {
          requestBody = JSON.parse(body);
        } catch (error) {
          onResponse({
            status: 400,
            statusText: 'Invalid JSON body',
            data: { error: 'Please check your JSON syntax and try again' },
            time: new Date().toISOString()
          });
          setLoading(false);
          return;
        }
      }

      const config = {
        method: method,
        url: url,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          // Add common headers that might help with CORS
          'Accept': 'application/json, text/plain, */*',
          'Access-Control-Allow-Origin': '*'
        },
        data: HTTP_METHODS[method].requiresBody ? requestBody : undefined,
        // Add timeout and validation
        timeout: 30000,
        validateStatus: status => status >= 200 && status < 600
      };

      console.log('Sending request with config:', config);

      const response = await api(config);
      
      console.log('Received response:', response);
      
      onResponse({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error('Request error:', error);
      onResponse({ 
        status: error.response?.status || 500,
        statusText: error.response?.statusText || error.message,
        headers: error.response?.headers || {},
        data: error.response?.data || { 
          error: error.message,
          details: 'This might be due to CORS restrictions. Try using a different URL or checking if the API allows cross-origin requests.'
        },
        time: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequest = () => {
    if (!requestName) {
      alert('Please enter a request name');
      return;
    }
    if (!collectionName) {
      alert('Please select or create a collection');
      return;
    }
    if (!url.trim()) {
      alert('Please enter a request URL');
      return;
    }

    const requestData = {
      id: crypto.randomUUID(),
      method,
      url: url.trim(),
      headers,
      body: HTTP_METHODS[method].requiresBody ? body : '',
      name: requestName.trim(),
      collectionName,
      type: 'request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      saveCollection(collectionName, requestData);
      // Update collections in local state
      const updatedCollections = getCollections();
      setCollections(updatedCollections.collections);
      // Show success message
      alert('Request saved successfully!');
      // Refresh collections in parent component - this will trigger ViewManager refresh
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      // Clear request name after successful save
      setRequestName('');
    } catch (error) {
      alert('Error saving request: ' + error.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify({
      method,
      url,
      headers,
      body: method !== 'GET' ? JSON.parse(body) : undefined
    }, null, 2));
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      alert('Please enter a collection name');
      return;
    }
    try {
      createCollection(newCollectionName.trim());
      // Update collections in local state
      const updatedCollections = getCollections();
      setCollections(updatedCollections.collections);
      setCollectionName(newCollectionName.trim());
      setNewCollectionName('');
      setCreateNewOpen(false);
      setAnchorEl(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Save Request Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef'
        }}
      >
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          Save Request
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center'
        }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={collectionName}
              onChange={(e) => {
                if (e.target.value === 'create_new') {
                  setCreateNewOpen(true);
                  setAnchorEl(e.currentTarget);
                } else {
                  setCollectionName(e.target.value);
                }
              }}
              displayEmpty
              sx={{
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  height: '36px'
                }
              }}
            >
              <MenuItem value="" disabled>Select Collection</MenuItem>
              {collections.map((collection) => (
                <MenuItem key={collection.id} value={collection.name}>
                  {collection.name}
                </MenuItem>
              ))}
              <MenuItem value="create_new">
                <Add sx={{ mr: 1, fontSize: 20 }} />
                Create New Collection
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Request Name"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                height: '36px',
                bgcolor: 'white'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSaveRequest}
            sx={{
              height: '36px',
              px: 3,
              bgcolor: '#FF6C37',
              '&:hover': {
                bgcolor: '#FF5419',
              }
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>

      {/* Create New Collection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={createNewOpen}
        onClose={() => {
          setCreateNewOpen(false);
          setAnchorEl(null);
          setNewCollectionName('');
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Create New Collection
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Collection Name"
            autoFocus
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              size="small"
              onClick={() => {
                setCreateNewOpen(false);
                setAnchorEl(null);
                setNewCollectionName('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleCreateCollection}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* URL Input Section */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        alignItems: 'center',
        borderBottom: '1px solid #e9ecef'
      }}>
        <FormControl size="small" sx={{ width: 120 }}>
          <Select 
            value={method} 
            onChange={(e) => handleMethodChange(e.target.value)}
            sx={{ 
              height: '36px',
              '& .MuiSelect-select': { 
                padding: '6px 12px',
                color: HTTP_METHODS[method].color,
                fontWeight: 'bold'
              }
            }}
          >
            {Object.keys(HTTP_METHODS).map((httpMethod) => (
              <MenuItem
                key={httpMethod}
                value={httpMethod}
                sx={{
                  color: HTTP_METHODS[httpMethod].color,
                  fontWeight: 'bold'
                }}
              >
                <Tooltip title={HTTP_METHODS[httpMethod].description} placement="right">
                  <span>{httpMethod}</span>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter request URL"
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '36px',
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            height: '36px',
            px: 3,
            bgcolor: HTTP_METHODS[method].color,
            '&:hover': {
              bgcolor: HTTP_METHODS[method].color,
              opacity: 0.9
            }
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
        <Tooltip title="Copy request as JSON">
          <IconButton onClick={copyToClipboard}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <RequestTabs value={activeTab} onChange={handleTabChange} />
      
      <Box sx={{ 
        flex: 1,
            display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        p: 2
      }}>
        {activeTab === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ mb: 2 }}>Query Params</Typography>
            <TextField
              multiline
              fullWidth
              rows={4}
              placeholder="Add query parameters (key=value format, one per line)"
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }
              }}
            />
        </Box>
      )}
        {activeTab === 1 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Headers</Typography>
            <TextField
              multiline
              fullWidth
              value={JSON.stringify(headers, null, 2)}
              onChange={(e) => {
                try {
                  setHeaders(JSON.parse(e.target.value));
                } catch (error) {
                  // Handle invalid JSON
                }
              }}
              placeholder="Request headers (JSON)"
        sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }
              }}
        />
          </Box>
        )}
        {activeTab === 2 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Body</Typography>
              <TextField
              multiline
                fullWidth
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={HTTP_METHODS[method].requiresBody ? "Request body (JSON)" : "This request doesn't require a body"}
              disabled={!HTTP_METHODS[method].requiresBody}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }
              }}
            />
            {HTTP_METHODS[method].requiresBody && !body && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                This request requires a JSON body
              </Typography>
            )}
        </Box>
      )}
        {activeTab === 3 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Pre-request Script</Typography>
              <TextField
              multiline
                fullWidth
              placeholder="Write your pre-request script here"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }
              }}
            />
        </Box>
      )}
        {activeTab === 4 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Request Settings</Typography>
        <TextField
              multiline
          fullWidth
              placeholder="Configure request settings"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }
              }}
          />
          </Box>
        )}
      </Box>
        </Box>
  );
};

export default RequestForm;
