import React, { useState, useEffect } from 'react';
import {
  Box, List, ListItem, ListItemIcon, ListItemText, Divider,
  IconButton, Typography, Fade, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button,
  ListItemButton, ListItemSecondaryAction, Badge
} from '@mui/material';
import {
  Collections as CollectionsIcon,
  Science as TestIcon,
  Group as GroupsIcon,
  Schedule as ScheduleIcon,
  Dashboard as DashboardIcon,
  Settings as EnvironmentsIcon,
  AccountTree as FlowsIcon,
  History as HistoryIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { createCollection } from '../../utils/dataManager';

const SIDEBAR_WIDTH = 160; // Match App.jsx DEFAULT_LEFT_WIDTH

const Sidebar = ({ refreshKey, onSelectRequest, history, selectedView, onViewChange }) => {
  const [activeItem, setActiveItem] = useState('collections');
  const [contentHeight, setContentHeight] = useState(0);
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [environments, setEnvironments] = useState([
    { id: 1, name: 'Development', active: true },
    { id: 2, name: 'Staging', active: false },
    { id: 3, name: 'Production', active: false }
  ]);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  const handleItemClick = (itemId) => {
    onViewChange(itemId);
  };

  const handleEnvironmentClick = (envId) => {
    setEnvironments(envs => 
      envs.map(env => ({
        ...env,
        active: env.id === envId
      }))
    );
  };

  const handleAddEnvironment = () => {
    const newId = Math.max(...environments.map(e => e.id)) + 1;
    setEnvironments([...environments, { id: newId, name: 'New Environment', active: false }]);
  };

  const handleCreateCollection = async () => {
    const trimmedName = newCollectionName.trim();
    if (trimmedName) {
      try {
        await createCollection({
          name: trimmedName,
          description: '',
          requests: []
        });
        setNewCollectionName('');
        setNewCollectionDialogOpen(false);
        setErrorMessage('');
        if (selectedView === 'collections' && typeof refreshKey === 'function') {
          console.warn("Refresh mechanism needs review");
        }
        setInternalRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error("Failed to create collection:", error);
        setErrorMessage(error.message || 'Failed to create collection. Check console.');
        if (error.message?.includes('already exists')) {
          setErrorMessage('A collection with this name already exists');
        }
      }
    }
  };

  useEffect(() => {
    const content = document.getElementById('sidebar-content');
    if (content) {
      setContentHeight(content.scrollHeight);
    }
  }, [activeItem]);

  const menuItems = [
    { id: 'collections', icon: CollectionsIcon, label: 'Collections' },
    { id: 'environments', icon: EnvironmentsIcon, label: 'Environments' },
    { id: 'test', icon: TestIcon, label: 'Test' },
    { id: 'groups', icon: GroupsIcon, label: 'Groups' },
    { id: 'schedule', icon: ScheduleIcon, label: 'Schedule' },
    { id: 'flows', icon: FlowsIcon, label: 'Flows' },
    { id: 'dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { id: 'history', icon: HistoryIcon, label: 'History' }
  ];

  return (
    <Box 
      sx={{ 
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        maxWidth: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <List sx={{ py: 1, flexShrink: 0, width: '100%' }} disablePadding>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.id}
              selected={selectedView === item.id}
              onClick={() => handleItemClick(item.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                minHeight: 40,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: selectedView === item.id ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ my: 1, borderColor: 'black' }} />

      <Dialog 
        open={newCollectionDialogOpen} 
        onClose={() => {
          setNewCollectionDialogOpen(false);
          setErrorMessage('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCollectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained" disabled={!newCollectionName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar; 