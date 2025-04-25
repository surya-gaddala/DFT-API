import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Add as AddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  PostAdd as PostAddIcon,
  DriveFileMove as MoveIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  getCollections, 
  saveCollection, 
  createCollection, 
  addFolder, 
  deleteCollection, 
  deleteFolder, 
  deleteRequest,
  updateRequest,
  addRequestToFolder,
  moveRequest,
  renameFolder,
  reorderItems
} from '../../utils/collectionManager.js';

const CollectionViewer = ({ onSelectRequest, refreshKey }) => {
  const [collections, setCollections] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenu, setContextMenu] = useState({ collection: null, request: null, folder: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(true);
  const [folderDialog, setFolderDialog] = useState({ open: false, collection: null });
  const [newFolderName, setNewFolderName] = useState('');
  const [requestDialog, setRequestDialog] = useState({ open: false, collection: null, folder: null });
  const [newRequest, setNewRequest] = useState({ name: '', method: 'GET', url: '' });
  const [nameError, setNameError] = useState('');
  const [moveDialog, setMoveDialog] = useState({ open: false, request: null, collection: null });
  const [renameDialog, setRenameDialog] = useState({ open: false, folder: null, collection: null });
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedCollections, setExpandedCollections] = useState({});
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [moveMenuAnchor, setMoveMenuAnchor] = useState(null);
  const [editRequestDialog, setEditRequestDialog] = useState({ open: false, request: null, collection: null, folder: null });

  useEffect(() => {
    const data = getCollections();
    setCollections(data.collections);
    
    // Initialize expanded state for collections
    const initialExpandedState = {};
    data.collections.forEach(collection => {
      initialExpandedState[collection.name] = false;
    });
    setExpandedCollections(initialExpandedState);
  }, [refreshKey]);

  const handleAccordionChange = (collectionName) => (event, isExpanded) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionName]: isExpanded
    }));
  };

  const handleMenuClick = (event, collection, request = null, folder = null) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setContextMenu({ collection, request, folder });
    setSelectedCollection(collection);
    if (request) {
      setSelectedRequest(request);
    }
    if (folder) {
      setSelectedFolder(folder);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextMenu({ collection: null, request: null, folder: null });
    setMoveMenuAnchor(null);
  };

  const handleDeleteCollection = () => {
    if (contextMenu.collection) {
      deleteCollection(contextMenu.collection.name);
      const data = getCollections();
      setCollections(data.collections);
    }
    handleMenuClose();
  };

  const handleDeleteRequest = () => {
    if (contextMenu.collection && contextMenu.request) {
      try {
        const data = getCollections();
        const collectionIndex = data.collections.findIndex(c => c.name === contextMenu.collection.name);
        
        if (collectionIndex === -1) return;
        
        let updatedCollections = [...data.collections];
        
        if (contextMenu.folder) {
          // Delete from folder
          const folderIndex = updatedCollections[collectionIndex].folders.findIndex(
            f => f.id === contextMenu.folder.id
          );
          
          if (folderIndex !== -1) {
            updatedCollections[collectionIndex].folders[folderIndex].requests = 
              updatedCollections[collectionIndex].folders[folderIndex].requests.filter(
                r => r.id !== contextMenu.request.id
              );
          }
        } else {
          // Delete from collection
          updatedCollections[collectionIndex].requests = 
            updatedCollections[collectionIndex].requests.filter(
              r => r.id !== contextMenu.request.id
            );
        }
        
        localStorage.setItem('apiCollections', JSON.stringify({ collections: updatedCollections }));
        setCollections(updatedCollections);
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request: ' + error.message);
      }
    }
  };

  const handleDeleteFolder = (collectionName, folderId) => {
    deleteFolder(collectionName, folderId);
    const data = getCollections();
    setCollections(data.collections);
    handleMenuClose();
  };

  const validateName = (name, collection, type, folder = null) => {
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return false;
    }

    if (type === 'collection') {
      const exists = collections.some(c => c.name === name.trim());
      if (exists) {
        setNameError('Collection with this name already exists');
        return false;
      }
    } else if (type === 'folder') {
      const exists = collection.folders?.some(f => f.name === name.trim());
      if (exists) {
        setNameError('Folder with this name already exists in this collection');
        return false;
      }
    } else if (type === 'request') {
      if (folder) {
        const exists = folder.requests?.some(r => r.name === name.trim());
        if (exists) {
          setNameError('Request with this name already exists in this folder');
          return false;
        }
      } else {
        const exists = collection.requests?.some(r => r.name === name.trim());
        if (exists) {
          setNameError('Request with this name already exists in this collection');
          return false;
        }
      }
    }

    setNameError('');
    return true;
  };

  const handleCreateCollection = () => {
    if (validateName(newCollectionName, null, 'collection')) {
      try {
        const updatedData = createCollection(newCollectionName.trim());
        const data = getCollections();
        setCollections(data.collections);
        setNewCollectionName('');
        setShowNewCollectionInput(false);
        setDialogOpen(false);
      } catch (error) {
        console.error('Error creating collection:', error);
      }
    }
  };

  const handleCreateFolder = () => {
    if (validateName(newFolderName, folderDialog.collection, 'folder')) {
      try {
        const updatedData = addFolder(folderDialog.collection.name, newFolderName.trim());
        const data = getCollections();
        setCollections(data.collections);
        setNewFolderName('');
        setFolderDialog({ open: false, collection: null });
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  };

  const handleCreateRequest = () => {
    if (validateName(newRequest.name, requestDialog.collection, 'request', requestDialog.folder)) {
      try {
        let updatedData;
        if (requestDialog.folder) {
          updatedData = addRequestToFolder(
            requestDialog.collection.name,
            requestDialog.folder.id,
            newRequest
          );
        } else {
          updatedData = saveCollection(requestDialog.collection.name, newRequest);
        }
        const data = getCollections();
        setCollections(data.collections);
        setNewRequest({ name: '', method: 'GET', url: '' });
        setRequestDialog({ open: false, collection: null, folder: null });
      } catch (error) {
        console.error('Error creating request:', error);
      }
    }
  };

  const handleMoveRequest = (targetCollectionName, targetFolderId = null) => {
    const requestToMove = moveDialog.request;
    const sourceCollection = moveDialog.collection;
    
    if (!requestToMove || !sourceCollection) {
      console.error('No request selected for moving');
      return;
    }

    try {
      const data = getCollections();
      let updatedCollections = [...data.collections];

      // Find source collection
      const sourceCollectionIndex = updatedCollections.findIndex(
        c => c.name === sourceCollection.name
      );

      if (sourceCollectionIndex === -1) {
        throw new Error('Source collection not found');
      }

      // Find target collection
      const targetCollectionIndex = updatedCollections.findIndex(
        c => c.name === targetCollectionName
      );

      if (targetCollectionIndex === -1) {
        throw new Error('Target collection not found');
      }

      // Create a copy of the request to move
      const requestCopy = { ...requestToMove };

      // Remove request from source
      if (contextMenu.folder) {
        // Remove from source folder
        const sourceFolder = updatedCollections[sourceCollectionIndex].folders.find(
          f => f.id === contextMenu.folder.id
        );
        if (sourceFolder) {
          sourceFolder.requests = sourceFolder.requests.filter(
            r => r.id !== requestCopy.id
          );
        }
      } else {
        // Remove from source collection
        updatedCollections[sourceCollectionIndex].requests = 
          updatedCollections[sourceCollectionIndex].requests.filter(
            r => r.id !== requestCopy.id
          );
      }

      // Add request to target
      if (targetFolderId) {
        // Add to target folder
        const targetFolder = updatedCollections[targetCollectionIndex].folders.find(
          f => f.id === targetFolderId
        );
        if (targetFolder) {
          if (!targetFolder.requests) {
            targetFolder.requests = [];
          }
          targetFolder.requests.push(requestCopy);
        }
      } else {
        // Add to target collection
        if (!updatedCollections[targetCollectionIndex].requests) {
          updatedCollections[targetCollectionIndex].requests = [];
        }
        updatedCollections[targetCollectionIndex].requests.push(requestCopy);
      }

      // Save changes
      localStorage.setItem('apiCollections', JSON.stringify({ collections: updatedCollections }));
      setCollections(updatedCollections);
      setMoveDialog({ open: false, request: null, collection: null });
      handleMenuClose();
    } catch (error) {
      console.error('Error moving request:', error);
      alert('Failed to move request: ' + error.message);
    }
  };

  const handleRenameFolder = () => {
    if (renameDialog.folder && renameDialog.collection && newFolderName.trim()) {
      try {
        const updatedData = renameFolder(
          renameDialog.collection.name,
          renameDialog.folder.id,
          newFolderName.trim()
        );
        const data = getCollections();
        setCollections(data.collections);
        setRenameDialog({ open: false, folder: null, collection: null });
        setNewFolderName('');
      } catch (error) {
        console.error('Error renaming folder:', error);
        setNameError(error.message);
      }
    }
  };

  const handleEditRequest = () => {
    if (editRequestDialog.request && editRequestDialog.collection) {
      try {
        const updatedRequest = {
          ...editRequestDialog.request,
          name: newRequest.name.trim(),
          method: newRequest.method,
          url: newRequest.url.trim(),
          updatedAt: new Date().toISOString()
        };

        updateRequest(editRequestDialog.collection.name, editRequestDialog.request.id, updatedRequest);
        const data = getCollections();
        setCollections(data.collections);
        setEditRequestDialog({ open: false, request: null, collection: null, folder: null });
        setNewRequest({ name: '', method: 'GET', url: '' });
        setNameError('');
      } catch (error) {
        console.error('Error updating request:', error);
        setNameError(error.message);
      }
    }
  };

  const handleLoadRequest = (request) => {
    // Create a complete copy of the request with all fields
    const completeRequest = {
      ...request,
      // Ensure all required fields exist with default values if not present
      method: request.method || 'GET',
      url: request.url || '',
      name: request.name || '',
      headers: request.headers || [],
      params: request.params || [],
      body: request.body || {
        type: 'none',
        content: ''
      },
      scripts: request.scripts || {
        pre: '',
        post: ''
      },
      settings: request.settings || {
        followRedirects: true,
        timeout: 0,
        verifySSL: true
      },
      history: request.history || [],
      createdAt: request.createdAt || new Date().toISOString(),
      updatedAt: request.updatedAt || new Date().toISOString()
    };

    // Call the parent component's onSelectRequest with the complete request
    onSelectRequest(completeRequest);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) {
      return;
    }

    const sourceCollectionId = source.droppableId.split('-')[1];
    const destCollectionId = destination.droppableId.split('-')[1];
    const sourceCollection = collections.find(c => c.id === sourceCollectionId);
    const destCollection = collections.find(c => c.id === destCollectionId);

    if (!sourceCollection || !destCollection) {
      return;
    }

    try {
      if (type === 'folder') {
        // Reorder folders within the same collection
        if (sourceCollectionId === destCollectionId) {
          const newFolders = Array.from(sourceCollection.folders);
          const [removed] = newFolders.splice(source.index, 1);
          newFolders.splice(destination.index, 0, removed);
          
          reorderItems(sourceCollection.name, { folders: newFolders });
        }
      } else if (type === 'request') {
        const sourceFolderId = source.droppableId.includes('folder') 
          ? source.droppableId.split('-')[2] 
          : null;
        const destFolderId = destination.droppableId.includes('folder')
          ? destination.droppableId.split('-')[2]
          : null;

        // Move request between collections/folders
        moveRequest(
          sourceCollection.name,
          draggableId,
          destCollection.name,
          destFolderId
        );
      }

      const data = getCollections();
      setCollections(data.collections);
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const renderRequests = (requests = [], collectionName, folder = null) => {
    if (!Array.isArray(requests)) return null;
    
    return requests.map((request) => (
      <ListItem
        key={`${collectionName}-${folder?.id || 'root'}-${request.id}`}
        secondaryAction={
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              const collection = collections.find(c => c.name === collectionName);
              setContextMenu({ collection, request, folder });
              setAnchorEl(e.currentTarget);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          '&:hover': { backgroundColor: 'action.hover' },
          cursor: 'pointer'
        }}
        onClick={() => handleLoadRequest(request)}
      >
        <ListItemText
          primary={
            <Box display="flex" alignItems="center">
              <Chip
                label={request.method}
                size="small"
                sx={{ 
                  mr: 1, 
                  width: 60, 
                  fontWeight: 'bold',
                  backgroundColor: 
                    request.method === 'GET' ? '#e8f5e9' :
                    request.method === 'POST' ? '#e3f2fd' :
                    request.method === 'PUT' ? '#fff8e1' :
                    request.method === 'DELETE' ? '#ffebee' : '#f3e5f5',
                  color: 'black'
                }}
              />
              <Typography noWrap>{request.name}</Typography>
            </Box>
          }
          secondary={
            <Typography noWrap variant="body2" color="text.secondary">
              {request.url}
            </Typography>
          }
        />
      </ListItem>
    ));
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Collections</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Collection
        </Button>
      </Box>
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {collections.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No collections found. Create a new collection to get started.
            </Typography>
          </Box>
        ) : (
          collections.map((collection) => (
            <Accordion
              key={`collection-${collection.id || collection.name}`}
              expanded={expandedCollections[collection.name] || false}
              onChange={handleAccordionChange(collection.name)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" flexGrow={1}>
                  <FolderIcon sx={{ mr: 1 }} />
                  <Typography>{collection.name}</Typography>
                  <Chip 
                    label={`${(collection.requests || []).length + (collection.folders || []).reduce((acc, folder) => acc + (folder.requests || []).length, 0)}`} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCollection(collection);
                    handleMenuClick(e, collection);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {renderRequests(collection.requests, collection.name)}
                  {(collection.folders || []).map((folder) => (
                    <div key={`folder-${collection.name}-${folder.id}`}>
                      <ListItem
                        sx={{
                          backgroundColor: 'action.hover',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main'
                        }}
                        secondaryAction={
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFolder(folder);
                              handleMenuClick(e, collection, null, folder);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => toggleFolder(folder.id)}
                          sx={{ mr: 1 }}
                        >
                          {expandedFolders[folder.id] ? <ArrowDownIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        {expandedFolders[folder.id] ? (
                          <FolderOpenIcon sx={{ mr: 1, color: 'primary.main' }} />
                        ) : (
                          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                        )}
                        <ListItemText 
                          primary={folder.name}
                          secondary={`${(folder.requests || []).length} requests`}
                        />
                      </ListItem>
                      <Collapse in={expandedFolders[folder.id]}>
                        <List dense sx={{ pl: 4 }}>
                          {renderRequests(folder.requests, collection.name, folder)}
                        </List>
                      </Collapse>
                    </div>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {contextMenu.request && (
          <>
            <MenuItem onClick={() => {
              handleLoadRequest(contextMenu.request);
              handleMenuClose();
            }}>
              <SendIcon sx={{ mr: 1 }} /> Load Request
            </MenuItem>
            <MenuItem onClick={() => {
              setEditRequestDialog({
                open: true,
                request: contextMenu.request,
                collection: contextMenu.collection,
                folder: contextMenu.folder
              });
              setNewRequest({
                name: contextMenu.request.name,
                method: contextMenu.request.method,
                url: contextMenu.request.url
              });
              handleMenuClose();
            }}>
              <EditIcon sx={{ mr: 1 }} /> Edit Request
            </MenuItem>
            <MenuItem onClick={() => {
              setMoveDialog({
                open: true,
                request: contextMenu.request,
                collection: contextMenu.collection
              });
              handleMenuClose();
            }}>
              <MoveIcon sx={{ mr: 1 }} /> Move Request
            </MenuItem>
            <MenuItem onClick={handleDeleteRequest}>
              <DeleteIcon sx={{ mr: 1 }} color="error" /> Delete Request
            </MenuItem>
          </>
        )}
        {contextMenu.folder && !contextMenu.request && (
          <>
            <MenuItem onClick={() => {
              setRequestDialog({ 
                open: true, 
                collection: contextMenu.collection,
                folder: contextMenu.folder 
              });
              handleMenuClose();
            }}>
              <PostAddIcon sx={{ mr: 1 }} /> Create Request
            </MenuItem>
            <MenuItem onClick={() => {
              setRenameDialog({
                open: true,
                folder: contextMenu.folder,
                collection: contextMenu.collection
              });
              setNewFolderName(contextMenu.folder.name);
              handleMenuClose();
            }}>
              <EditIcon sx={{ mr: 1 }} /> Rename Folder
            </MenuItem>
            <MenuItem onClick={() => handleDeleteFolder(contextMenu.collection.name, contextMenu.folder.id)}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete Folder
            </MenuItem>
          </>
        )}
        {contextMenu.collection && !contextMenu.request && !contextMenu.folder && (
          <>
            <MenuItem onClick={() => {
              setRequestDialog({ 
                open: true, 
                collection: contextMenu.collection,
                folder: null
              });
              handleMenuClose();
            }}>
              <PostAddIcon sx={{ mr: 1 }} /> Create Request
            </MenuItem>
            <MenuItem onClick={() => {
              setFolderDialog({ open: true, collection: contextMenu.collection });
              handleMenuClose();
            }}>
              <CreateNewFolderIcon sx={{ mr: 1 }} /> Create Folder
            </MenuItem>
            <MenuItem onClick={handleDeleteCollection}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete Collection
            </MenuItem>
          </>
        )}
      </Menu>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setNameError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            error={Boolean(nameError)}
          />
          {nameError && (
            <FormHelperText error>{nameError}</FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setNameError('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={folderDialog.open}
        onClose={() => {
          setFolderDialog({ open: false, collection: null });
          setNameError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            error={Boolean(nameError)}
          />
          {nameError && (
            <FormHelperText error>{nameError}</FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFolderDialog({ open: false, collection: null });
            setNameError('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={requestDialog.open}
        onClose={() => {
          setRequestDialog({ open: false, collection: null, folder: null });
          setNameError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          New Request
          {requestDialog.folder && (
            <Typography variant="subtitle2" color="text.secondary">
              in folder: {requestDialog.folder.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Request Name"
            fullWidth
            variant="outlined"
            value={newRequest.name}
            onChange={(e) => setNewRequest({ ...newRequest, name: e.target.value })}
            error={Boolean(nameError)}
          />
          {nameError && (
            <FormHelperText error>{nameError}</FormHelperText>
          )}
          <TextField
            select
            margin="dense"
            label="Method"
            fullWidth
            variant="outlined"
            value={newRequest.method}
            onChange={(e) => setNewRequest({ ...newRequest, method: e.target.value })}
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="outlined"
            value={newRequest.url}
            onChange={(e) => setNewRequest({ ...newRequest, url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRequestDialog({ open: false, collection: null, folder: null });
            setNameError('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRequest}
            disabled={!newRequest.name.trim() || !newRequest.url.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={moveDialog.open}
        onClose={() => setMoveDialog({ open: false, request: null, collection: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Move Request</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Moving: {moveDialog.request ? moveDialog.request.name : ''}
          </Typography>
          <List>
            {collections.map((collection) => (
              <React.Fragment key={`move-${collection.id || collection.name}`}>
                <ListItem
                  button
                  onClick={() => handleMoveRequest(collection.name)}
                  disabled={collection.name === moveDialog.collection?.name && !contextMenu.folder}
                >
                  <ListItemText primary={collection.name} />
                </ListItem>
                {(collection.folders || []).map((folder) => (
                  <ListItem
                    key={`move-folder-${folder.id}`}
                    button
                    sx={{ pl: 4 }}
                    onClick={() => handleMoveRequest(collection.name, folder.id)}
                    disabled={
                      collection.name === moveDialog.collection?.name &&
                      folder.id === contextMenu.folder?.id
                    }
                  >
                    <FolderIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <ListItemText primary={folder.name} />
                  </ListItem>
                ))}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialog({ open: false, request: null, collection: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={renameDialog.open}
        onClose={() => {
          setRenameDialog({ open: false, folder: null, collection: null });
          setNewFolderName('');
          setNameError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            error={Boolean(nameError)}
          />
          {nameError && (
            <FormHelperText error>{nameError}</FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRenameDialog({ open: false, folder: null, collection: null });
            setNewFolderName('');
            setNameError('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRenameFolder}
            disabled={!newFolderName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editRequestDialog.open}
        onClose={() => {
          setEditRequestDialog({ open: false, request: null, collection: null, folder: null });
          setNewRequest({ name: '', method: 'GET', url: '' });
          setNameError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Request
          {editRequestDialog.folder && (
            <Typography variant="subtitle2" color="text.secondary">
              in folder: {editRequestDialog.folder.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Request Name"
            fullWidth
            variant="outlined"
            value={newRequest.name}
            onChange={(e) => setNewRequest({ ...newRequest, name: e.target.value })}
            error={Boolean(nameError)}
          />
          {nameError && (
            <FormHelperText error>{nameError}</FormHelperText>
          )}
          <TextField
            select
            margin="dense"
            label="Method"
            fullWidth
            variant="outlined"
            value={newRequest.method}
            onChange={(e) => setNewRequest({ ...newRequest, method: e.target.value })}
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="outlined"
            value={newRequest.url}
            onChange={(e) => setNewRequest({ ...newRequest, url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditRequestDialog({ open: false, request: null, collection: null, folder: null });
            setNewRequest({ name: '', method: 'GET', url: '' });
            setNameError('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditRequest}
            disabled={!newRequest.name.trim() || !newRequest.url.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionViewer; 