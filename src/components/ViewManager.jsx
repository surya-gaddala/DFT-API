import React from 'react';
import { Box } from '@mui/material';
import RequestForm from './RequestForm';
import ResponseDisplay from './ResponseDisplay';
import HistoryViewer from './viewers/HistoryViewer';
import CollectionsViewer from './viewers/CollectionsViewer';
import EnvironmentsViewer from './viewers/EnvironmentsViewer';

const ViewManager = ({ 
  view, 
  showMiddlePanel, 
  onResponse, 
  history, 
  onSelectRequest,
  collections,
  onSaveSuccess
}) => {
  const renderView = () => {
    switch (view) {
      case 'collections':
        return (
          <CollectionsViewer
            collections={collections}
            onSaveSuccess={onSaveSuccess}
          />
        );
      case 'history':
        return (
          <HistoryViewer
            history={history}
            onSelectRequest={onSelectRequest}
          />
        );
      case 'environments':
        return <EnvironmentsViewer />;
      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <RequestForm onResponse={onResponse} />
            {showMiddlePanel && <ResponseDisplay />}
          </Box>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {renderView()}
    </Box>
  );
};

export default ViewManager; 