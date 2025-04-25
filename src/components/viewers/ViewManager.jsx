import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Import the actual viewer components
import CollectionViewer from './CollectionViewer';
// import EnvironmentsViewer from './EnvironmentsViewer'; // File doesn't exist yet
import TestViewer from './TestViewer';
import GroupsViewer from './GroupsViewer';
// import ScheduleViewer from './ScheduleViewer'; // File doesn't exist yet
import FlowsViewer from './FlowsViewer';
// import DashboardViewer from './DashboardViewer'; // File doesn't exist yet
import HistoryViewer from './HistoryViewer';

// Placeholder for Environments viewer (if not created yet)
/*
const EnvironmentsViewer = () => (
  <Paper sx={{ p: 2, m: 1 }}>
    <Typography variant="h6">Environments</Typography>
    <Typography>Environments management interface coming soon.</Typography>
  </Paper>
);
*/

// Placeholder for Schedule viewer (if not created yet)
/*
const ScheduleViewer = () => (
  <Paper sx={{ p: 2, m: 1 }}>
    <Typography variant="h6">Schedule</Typography>
    <Typography>Test scheduling interface coming soon.</Typography>
  </Paper>
);
*/

// Placeholder for Dashboard viewer (if not created yet)
/*
const DashboardViewer = () => (
  <Paper sx={{ p: 2, m: 1 }}>
    <Typography variant="h6">Dashboard</Typography>
    <Typography>Dashboard interface coming soon.</Typography>
  </Paper>
);
*/

const ViewManager = ({ selectedView, onSelectRequest, refreshKey }) => {

  const renderView = () => {
    switch (selectedView) {
      case 'collections':
        return <CollectionViewer onSelectRequest={onSelectRequest} refreshKey={refreshKey} />;
      case 'environments':
        // return <EnvironmentsViewer />;
        return <Typography sx={{ p: 2 }}>Environments View Coming Soon</Typography>; // Placeholder
      case 'test':
        return <TestViewer />;
      case 'groups':
        return <GroupsViewer />;
      case 'schedule':
        // return <ScheduleViewer />;
        return <Typography sx={{ p: 2 }}>Schedule View Coming Soon</Typography>; // Placeholder
      case 'flows':
        return <FlowsViewer />;
      case 'dashboard':
        // return <DashboardViewer />;
        return <Typography sx={{ p: 2 }}>Dashboard View Coming Soon</Typography>; // Placeholder
      case 'history':
        return <HistoryViewer onSelectRequest={onSelectRequest} />;
      default:
        return (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Select a view from the sidebar
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
      {renderView()}
    </Box>
  );
};

export default ViewManager; 