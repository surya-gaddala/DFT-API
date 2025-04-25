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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import {
  fetchEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment
} from '../../utils/dataManager';

const EnvironmentsViewer = () => {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [newVariable, setNewVariable] = useState({ key: '', value: '' });
  const [newEnvName, setNewEnvName] = useState('');

  // Fetch environments on component mount
  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    setLoading(true);
    try {
      const data = await fetchEnvironments();
      setEnvironments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load environments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) return;

    try {
      const newEnv = await createEnvironment({
        name: newEnvName,
        active: false,
        variables: []
      });
      setEnvironments(prevEnvs => [...prevEnvs, newEnv]);
      setDialogOpen(false);
      setNewEnvName('');
      setError(null);
    } catch (err) {
      setError('Failed to create environment');
    }
  };

  const handleUpdateEnvironment = async (envId, updates) => {
    try {
      const updatedEnv = await updateEnvironment(envId, updates);
      setEnvironments(prevEnvs =>
        prevEnvs.map(env =>
          env.id === envId ? updatedEnv : env
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to update environment');
    }
  };

  const handleDeleteEnvironment = async (envId) => {
    try {
      await deleteEnvironment(envId);
      setEnvironments(prevEnvs =>
        prevEnvs.filter(env => env.id !== envId)
      );
      setError(null);
    } catch (err) {
      setError('Failed to delete environment');
    }
  };

  const handleActivate = async (envId) => {
    // Deactivate all environments and activate the selected one
    try {
      await Promise.all(
        environments.map(env =>
          updateEnvironment(env.id, { ...env, active: env.id === envId })
        )
      );
      await loadEnvironments(); // Reload to get updated state
      setError(null);
    } catch (err) {
      setError('Failed to update environment status');
    }
  };

  const handleAddVariable = async (envId) => {
    if (!newVariable.key || !newVariable.value) return;

    const env = environments.find(e => e.id === envId);
    if (!env) return;

    try {
      const updatedEnv = await updateEnvironment(envId, {
        ...env,
        variables: [...env.variables, newVariable]
      });
      setEnvironments(prevEnvs =>
        prevEnvs.map(env =>
          env.id === envId ? updatedEnv : env
        )
      );
      setNewVariable({ key: '', value: '' });
      setError(null);
    } catch (err) {
      setError('Failed to add variable');
    }
  };

  const handleDeleteVariable = async (envId, variableKey) => {
    const env = environments.find(e => e.id === envId);
    if (!env) return;

    try {
      const updatedEnv = await updateEnvironment(envId, {
        ...env,
        variables: env.variables.filter(v => v.key !== variableKey)
      });
      setEnvironments(prevEnvs =>
        prevEnvs.map(env =>
          env.id === envId ? updatedEnv : env
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to delete variable');
    }
  };

  const handleCopyEnvironment = async (env) => {
    try {
      const newEnv = await createEnvironment({
        ...env,
        name: `${env.name} (Copy)`,
        active: false
      });
      setEnvironments(prevEnvs => [...prevEnvs, newEnv]);
      setError(null);
    } catch (err) {
      setError('Failed to copy environment');
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Environments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              setSelectedEnv(null);
              setNewEnvName('');
              setDialogOpen(true);
            }}
            disabled={loading}
          >
            New Environment
          </Button>
        </Box>
      </Box>

      {/* Environments List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Loading environments..." />
          </ListItem>
        ) : environments.length === 0 ? (
          <ListItem>
            <ListItemText primary="No environments found" />
          </ListItem>
        ) : (
          environments.map((env) => (
            <React.Fragment key={env.id}>
              <ListItem
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {env.name}
                      {env.active && (
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: 'success.light',
                            color: 'success.contrastText',
                            px: 1,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Active
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={`${env.variables.length} variables`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={env.active}
                    onChange={() => handleActivate(env.id)}
                    size="small"
                    disabled={loading}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedEnv(env);
                      setNewEnvName(env.name);
                      setDialogOpen(true);
                    }}
                    disabled={loading}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyEnvironment(env)}
                    disabled={loading}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteEnvironment(env.id)}
                    disabled={loading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
              <Box sx={{ px: 2, pb: 2 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Variable</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell align="right" width={100}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {env.variables.map((variable, index) => (
                        <TableRow key={index}>
                          <TableCell>{variable.key}</TableCell>
                          <TableCell>{variable.value}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteVariable(env.id, variable.key)}
                              disabled={loading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>
                          <TextField
                            placeholder="Variable name"
                            size="small"
                            value={newVariable.key}
                            onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            placeholder="Value"
                            size="small"
                            value={newVariable.value}
                            onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => handleAddVariable(env.id)}
                            disabled={loading || !newVariable.key || !newVariable.value}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Environment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEnv ? 'Edit Environment' : 'New Environment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Environment Name"
            fullWidth
            variant="outlined"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedEnv) {
                handleUpdateEnvironment(selectedEnv.id, { ...selectedEnv, name: newEnvName });
              } else {
                handleCreateEnvironment();
              }
              setDialogOpen(false);
            }}
            disabled={!newEnvName.trim()}
          >
            {selectedEnv ? 'Save Changes' : 'Create'}
          </Button>
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

export default EnvironmentsViewer; 