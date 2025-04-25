import React from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, InputBase, Button, Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ minHeight: '40px' }}>
      <Toolbar sx={{ minHeight: '40px', py: 0.5 }}>
        <IconButton size="small" edge="start" sx={{ mr: 0.5 }}>
          <MenuIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <IconButton size="small" sx={{ mr: 0.5 }}>
          <ArrowBackIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <IconButton size="small" sx={{ mr: 1 }}>
          <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <Typography variant="body2" sx={{ mr: 1, fontSize: '0.75rem' }}>Home</Typography>
        <Typography variant="body2" sx={{ mr: 1, fontSize: '0.75rem' }}>Workspaces</Typography>
        <Typography variant="body2" sx={{ mr: 1, fontSize: '0.75rem' }}>API Network</Typography>
        <Box sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'grey.100',
          borderRadius: 0.5,
          px: 1,
          mx: 1,
        }}>
          <SearchIcon sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
          <InputBase
            placeholder="Search"
            sx={{ 
              flexGrow: 1,
              fontSize: '0.75rem',
              '& input': {
                py: 0.5
              }
            }}
          />
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ 
            mr: 0.5,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1
          }}
        >
          Invite
        </Button>
        <IconButton size="small" sx={{ p: 0.5 }}>
          <SettingsIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <IconButton size="small" sx={{ p: 0.5 }}>
          <NotificationsIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 