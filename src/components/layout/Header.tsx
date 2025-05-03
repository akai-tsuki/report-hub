import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/auth';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Report Hub' }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer' 
          }}
          onClick={() => navigate('/reports')}
        >
          {title}
        </Typography>
        
        {currentUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Chip
              avatar={
                currentUser.photoURL ? (
                  <Avatar 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'}
                  />
                ) : (
                  <Avatar>
                    {(currentUser.displayName || 'U')[0]}
                  </Avatar>
                )
              }
              label={currentUser.displayName || 'Anonymous User'}
              variant="outlined"
              color="default"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-avatar': {
                  width: 28,
                  height: 28,
                },
                '& .MuiChip-label': {
                  fontWeight: 'medium',
                },
              }}
            />
          </Box>
        )}
        
        <Button 
          color="inherit" 
          onClick={handleSignOut} 
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;