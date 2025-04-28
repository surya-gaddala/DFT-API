import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const EnvironmentsViewer = () => {
  const [environments, setEnvironments] = useState([]);
  const [currentEnv, setCurrentEnv] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Load environments from localStorage
    const savedEnvs = localStorage.getItem('environments');
    if (savedEnvs) {
      setEnvironments(JSON.parse(savedEnvs));
    }
    
    const current = localStorage.getItem('currentEnvironment');
    if (current) {
      setCurrentEnv(current);
    }
  }, []);

  const handleCreateEnvironment = () => {
    if (!newEnvName.trim()) return;

    const newEnv = {
      name: newEnvName.trim(),
      variables: {
        baseUrl: baseUrl.trim()
      }
    };

    const updatedEnvs = [...environments, newEnv];
    setEnvironments(updatedEnvs);
    localStorage.setItem('environments', JSON.stringify(updatedEnvs));
    setOpenDialog(false);
    setNewEnvName('');
    setBaseUrl('');
  };

  const handleDeleteEnv = (envName) => {
    const updatedEnvs = environments.filter(env => env.name !== envName);
    setEnvironments(updatedEnvs);
    localStorage.setItem('environments', JSON.stringify(updatedEnvs));
    if (currentEnv === envName) {
      setCurrentEnv('');
      localStorage.removeItem('currentEnvironment');
    }
  };

  const handleSetCurrent = (envName) => {
    setCurrentEnv(envName);
    localStorage.setItem('currentEnvironment', envName);
  };

  return (
    <Box sx={{ 
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Environments List */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Environments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Environment
          </Button>
        </Box>
        
        <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Environment: {currentEnv || 'None'}
          </Typography>
        </Paper>

        <List>
          {environments.map((env) => (
            <React.Fragment key={env.name}>
              <ListItem
                sx={{
                  bgcolor: currentEnv === env.name ? 'action.selected' : 'background.paper',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={env.name}
                  secondary={`Base URL: ${env.variables.baseUrl}`}
                />
                <Tooltip title="Set as current">
                  <IconButton
                    edge="end"
                    onClick={() => handleSetCurrent(env.name)}
                    sx={{ mr: 1 }}
                  >
                    {currentEnv === env.name ? <CheckIcon /> : null}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete environment">
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteEnv(env.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Coming Soon Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 600,
          mx: 'auto',
          bgcolor: 'background.default'
        }}
      >
        <ConstructionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Advanced Features Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We're working on enhanced environment management features:
        </Typography>
        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography component="div" sx={{ mb: 2 }}>
            ✓ Environment-specific variables and secrets
          </Typography>
          <Typography component="div" sx={{ mb: 2 }}>
            ✓ Custom functions for request processing
          </Typography>
          <Typography component="div" sx={{ mb: 2 }}>
            ✓ Import/Export configurations
          </Typography>
          <Typography component="div">
            ✓ Team sharing capabilities
          </Typography>
        </Box>
      </Paper>

      {/* Create Environment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Environment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Environment Name"
            fullWidth
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Base URL"
            fullWidth
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEnvironment} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnvironmentsViewer; 