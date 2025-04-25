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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { fetchTests, createTest, runTest } from '../../utils/dataManager';

const TestViewer = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tests on component mount
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await fetchTests();
      setTests(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      const newTest = await createTest({
        name: 'New Test',
        status: 'pending',
        assertions: 0,
        passed: 0
      });
      setTests(prevTests => [...prevTests, newTest]);
      setError(null);
    } catch (err) {
      setError('Failed to create test');
    }
  };

  const handleRunTest = async (testId) => {
    try {
      const updatedTest = await runTest(testId);
      setTests(prevTests =>
        prevTests.map(test =>
          test.id === testId ? updatedTest : test
        )
      );
      setError(null);
    } catch (err) {
      setError(`Failed to run test ${testId}`);
    }
  };

  const handleRunAllTests = async () => {
    setLoading(true);
    try {
      await Promise.all(tests.map(test => runTest(test.id)));
      await loadTests(); // Reload all tests to get updated results
      setError(null);
    } catch (err) {
      setError('Failed to run all tests');
    } finally {
      setLoading(false);
    }
  };

  // Filter tests based on status and search query
  const filteredTests = tests.filter(test => {
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckIcon color="success" />;
      case 'failed':
        return <CloseIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Test Runner</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={handleCreateTest}
            disabled={loading}
          >
            New Test
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search tests..."
            sx={{ flexGrow: 1 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="passed">Passed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Test List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {loading ? (
          <ListItem>
            <ListItemText primary="Loading tests..." />
          </ListItem>
        ) : filteredTests.length === 0 ? (
          <ListItem>
            <ListItemText primary="No tests found" />
          </ListItem>
        ) : (
          filteredTests.map((test) => (
            <React.Fragment key={test.id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRunTest(test.id)}
                      disabled={loading}
                    >
                      <PlayIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(test.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography component="span" variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {test.name}
                      <Chip
                        label={`${test.passed}/${test.assertions}`}
                        size="small"
                        color={getStatusColor(test.status)}
                        variant="outlined"
                      />
                    </Typography>
                  }
                  secondary={
                    <Typography component="span" variant="caption" color="text.secondary">
                      Last run: {test.lastRun ? new Date(test.lastRun).toLocaleString() : 'Never'}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Summary Footer */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total Tests: {tests.length}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            color="primary"
            onClick={handleRunAllTests}
            disabled={loading || tests.length === 0}
          >
            Run All Tests
          </Button>
        </Box>
      </Paper>

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

export default TestViewer; 