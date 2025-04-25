import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import {
  fetchFlows,
  createFlow,
  updateFlow,
  deleteFlow,
  executeFlow
} from '../../utils/dataManager';

const FlowsViewer = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeFlowId, setActiveFlowId] = useState(null);

  // Fetch flows on component mount
  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const data = await fetchFlows();
      setFlows(data);
      setError(null);
    } catch (err) {
      setError('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = async (flowData) => {
    try {
      const newFlow = await createFlow({
        name: flowData.name,
        description: flowData.description,
        steps: [],
        status: 'ready'
      });
      setFlows(prevFlows => [...prevFlows, newFlow]);
      setError(null);
    } catch (err) {
      setError('Failed to create flow');
    }
  };

  const handleExecuteFlow = async (flowId) => {
    setActiveFlowId(flowId);
    try {
      const result = await executeFlow(flowId);
      setFlows(prevFlows =>
        prevFlows.map(flow =>
          flow.id === flowId ? { ...flow, lastRun: new Date().toISOString(), status: result.status } : flow
        )
      );
      setError(null);
    } catch (err) {
      setError(`Failed to execute flow ${flowId}`);
    } finally {
      setActiveFlowId(null);
    }
  };

  const handleDeleteFlow = async (flowId) => {
    try {
      await deleteFlow(flowId);
      setFlows(prevFlows => prevFlows.filter(flow => flow.id !== flowId));
      setError(null);
    } catch (err) {
      setError('Failed to delete flow');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'running':
        return <ScheduleIcon color="primary" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'running':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Filter flows based on search query
  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">API Flows</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              setSelectedFlow(null);
              setDialogOpen(true);
            }}
            disabled={loading}
          >
            New Flow
          </Button>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search flows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Flows List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Loading flows..." />
          </ListItem>
        ) : filteredFlows.length === 0 ? (
          <ListItem>
            <ListItemText primary="No flows found" />
          </ListItem>
        ) : (
          filteredFlows.map((flow) => (
            <React.Fragment key={flow.id}>
              <ListItem
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(flow.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography component="span" variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {flow.name}
                      <Chip
                        label={flow.status}
                        size="small"
                        color={getStatusColor(flow.status)}
                        variant="outlined"
                      />
                    </Typography>
                  }
                  secondary={
                    <Typography component="span" variant="caption" color="text.secondary">
                      {flow.description}
                      {flow.lastRun && ` • Last run: ${new Date(flow.lastRun).toLocaleString()}`}
                    </Typography>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleExecuteFlow(flow.id)}
                    disabled={loading || activeFlowId === flow.id}
                  >
                    <PlayIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedFlow(flow);
                      setMenuAnchor(e.currentTarget);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Flow Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedFlow ? 'Edit Flow' : 'New Flow'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Flow Name"
            fullWidth
            variant="outlined"
            defaultValue={selectedFlow?.name || ''}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            defaultValue={selectedFlow?.description || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Handle save
              setDialogOpen(false);
            }}
          >
            {selectedFlow ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flow Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setDialogOpen(true);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedFlow) {
              handleDeleteFlow(selectedFlow.id);
            }
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

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

export default FlowsViewer; 