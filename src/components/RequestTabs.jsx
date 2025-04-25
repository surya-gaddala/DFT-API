import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import {
  Settings as SettingsIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

const RequestTabs = ({ value, onChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={value} 
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: '36px',
          '& .MuiTab-root': {
            minHeight: '36px',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 500,
            py: 0,
            px: 2
          }
        }}
      >
        <Tab label="Params" />
        <Tab label="Headers" />
        <Tab label="Body" />
        <Tab 
          icon={<CodeIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="Scripts" 
        />
        <Tab 
          icon={<SettingsIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="Settings" 
        />
      </Tabs>
    </Box>
  );
};

export default RequestTabs; 