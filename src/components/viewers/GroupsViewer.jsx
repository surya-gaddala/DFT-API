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
  Collapse,
  Chip,
  Menu,
  MenuItem,
  ListItemButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as RequestIcon,
  PlayArrow as PlayIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import {
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addToGroup,
  removeFromGroup
} from '../../utils/dataManager';

const GroupsViewer = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Fetch groups on component mount
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await fetchGroups();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const newGroup = await createGroup({
        name: newGroupName,
        description: newGroupDescription,
        items: []
      });
      setGroups(prevGroups => [...prevGroups, newGroup]);
      setDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setError(null);
    } catch (err) {
      setError('Failed to create group');
    }
  };

  const handleUpdateGroup = async (groupId) => {
    if (!newGroupName.trim()) return;

    try {
      const updatedGroup = await updateGroup(groupId, {
        name: newGroupName,
        description: newGroupDescription
      });
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId ? updatedGroup : group
        )
      );
      setDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to update group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
      setError(null);
    } catch (err) {
      setError('Failed to delete group');
    }
  };

  const handleRemoveItem = async (groupId, itemId) => {
    try {
      await removeFromGroup(groupId, itemId);
      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? { ...group, items: group.items.filter(item => item.id !== itemId) }
            : group
        )
      );
      setError(null);
    } catch (err) {
      setError('Failed to remove item from group');
    }
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  };

  // Filter groups based on search query
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupItems = (items) => {
    return items.map((item, index) => (
      <ListItem
        key={item.id}
        sx={{
          pl: 4,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <PlayIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleRemoveItem(selectedGroup.id, item.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <ListItemIcon>
          <RequestIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          secondary={item.method}
          primaryTypographyProps={{
            sx: { fontSize: '0.9rem' }
          }}
        />
      </ListItem>
    ));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Request Groups</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              setSelectedGroup(null);
              setNewGroupName('');
              setNewGroupDescription('');
              setDialogOpen(true);
            }}
            disabled={loading}
          >
            New Group
          </Button>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Groups List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Loading groups..." />
          </ListItem>
        ) : filteredGroups.length === 0 ? (
          <ListItem>
            <ListItemText primary="No groups found" />
          </ListItem>
        ) : (
          filteredGroups.map((group) => (
            <React.Fragment key={group.id}>
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedGroup(group);
                      setMenuAnchor(e.currentTarget);
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => toggleGroupExpansion(group.id)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    {expandedGroups.has(group.id) ? (
                      <FolderOpenIcon color="primary" />
                    ) : (
                      <FolderIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography component="span" variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {group.name}
                        <Chip
                          label={`${group.items?.length || 0} items`}
                          size="small"
                          variant="outlined"
                        />
                      </Typography>
                    }
                    secondary={group.description}
                  />
                  {expandedGroups.has(group.id) ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedGroups.has(group.id)} timeout="auto">
                {group.items?.length > 0 ? (
                  renderGroupItems(group.items)
                ) : (
                  <ListItem sx={{ pl: 4 }}>
                    <ListItemText
                      secondary="No items in this group"
                      secondaryTypographyProps={{
                        sx: { fontStyle: 'italic' }
                      }}
                    />
                  </ListItem>
                )}
              </Collapse>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Group Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedGroup ? 'Edit Group' : 'New Group'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedGroup) {
                handleUpdateGroup(selectedGroup.id);
              } else {
                handleCreateGroup();
              }
            }}
            disabled={!newGroupName.trim()}
          >
            {selectedGroup ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setNewGroupName(selectedGroup.name);
            setNewGroupDescription(selectedGroup.description || '');
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
            if (selectedGroup) {
              handleDeleteGroup(selectedGroup.id);
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

export default GroupsViewer; 