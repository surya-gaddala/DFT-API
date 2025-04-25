import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Divider,
  TextField,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  ContentCopy as CopyIcon,
  Schedule as TimeIcon,
  Check as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { fetchHistory, clearHistory } from '../../utils/dataManager';

const HistoryViewer = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
      setError(null);
      setClearDialogOpen(false);
    } catch (err) {
      setError('Failed to clear history');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <TimeIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'primary';
      case 'POST':
        return 'success';
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  // Filter history based on search query and status
  const filteredHistory = history.filter(item => {
    const matchesSearch = (
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.method.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Request History</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              size="small"
              onClick={(e) => setFilterAnchor(e.currentTarget)}
            >
              {selectedStatus === 'all' ? 'All Status' : selectedStatus}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              size="small"
              onClick={() => setClearDialogOpen(true)}
              disabled={history.length === 0}
            >
              Clear History
            </Button>
          </Box>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* History List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Loading history..." />
          </ListItem>
        ) : filteredHistory.length === 0 ? (
          <ListItem>
            <ListItemText primary="No requests found" />
          </ListItem>
        ) : (
          filteredHistory.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => {
                  setSelectedItem(item);
                  setDetailsDialogOpen(true);
                }}
                button
              >
                <ListItemIcon>
                  {getStatusIcon(item.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography component="span" variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={item.method}
                        size="small"
                        color={getMethodColor(item.method)}
                      />
                      <Typography
                        component="span"
                        sx={{
                          maxWidth: '500px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.url}
                      </Typography>
                    </Typography>
                  }
                  secondary={
                    <Typography component="span" variant="caption" color="text.secondary">
                      {new Date(item.timestamp).toLocaleString()}
                      {item.duration && ` • ${item.duration}ms`}
                      {item.status === 'error' && ` • ${item.error}`}
                    </Typography>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.url);
                  }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setSelectedStatus('all');
            setFilterAnchor(null);
          }}
        >
          All Status
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedStatus('success');
            setFilterAnchor(null);
          }}
        >
          <ListItemIcon>
            <SuccessIcon color="success" fontSize="small" />
          </ListItemIcon>
          Success
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedStatus('error');
            setFilterAnchor(null);
          }}
        >
          <ListItemIcon>
            <ErrorIcon color="error" fontSize="small" />
          </ListItemIcon>
          Error
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedStatus('pending');
            setFilterAnchor(null);
          }}
        >
          <ListItemIcon>
            <TimeIcon color="warning" fontSize="small" />
          </ListItemIcon>
          Pending
        </MenuItem>
      </Menu>

      {/* Clear History Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear History</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all request history? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClearHistory}
            color="error"
            variant="contained"
          >
            Clear History
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Method</Typography>
                <Chip
                  label={selectedItem.method}
                  color={getMethodColor(selectedItem.method)}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">URL</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {selectedItem.url}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Headers</Typography>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedItem.headers, null, 2)}
                  </pre>
                </Paper>
              </Box>
              {selectedItem.body && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Request Body</Typography>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedItem.body, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
              {selectedItem.response && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Response</Typography>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedItem.response, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
              {selectedItem.error && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Error</Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: 'error.light' }}>
                    <Typography color="error.contrastText">
                      {selectedItem.error}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistoryViewer; 