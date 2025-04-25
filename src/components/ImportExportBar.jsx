// src/components/ImportExportBar.jsx
import React, { useRef, useState } from 'react';
import { 
  Button, IconButton, Tooltip, Box,
  Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, LinearProgress
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Download as DownloadIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { exportCollections, importCollections } from '../utils/collectionmanager';

const ImportExportBar = ({ onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    
    try {
      await importCollections(file);
      onImportSuccess?.();
      setConfirmOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to import collections');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = () => {
    try {
      exportCollections();
    } catch (err) {
      setError('Failed to export collections');
    }
  };

  return (
    <Box display="flex" gap={1} justifyContent="space-between" sx={{ p: 1, bgcolor: 'background.paper' }}>
      <Box display="flex" gap={1}>
        <Tooltip title="Import Collections">
          <Button
            startIcon={<RestoreIcon />}
            onClick={handleImportClick}
            variant="outlined"
            size="small"
          >
            Import
          </Button>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
          disabled={importing}
        />
      </Box>

      <Box display="flex" gap={1}>
        <Tooltip title="Export All Collections">
          <Button
            startIcon={<BackupIcon />}
            onClick={handleExport}
            variant="outlined"
            size="small"
          >
            Export
          </Button>
        </Tooltip>
      </Box>

      {importing && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />}
      
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Import Successful</DialogTitle>
        <DialogContent>
          Your collections have been successfully imported.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImportExportBar;