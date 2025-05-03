import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../services/reports';
import { GroupConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';

const GroupSettings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<GroupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteGroupName, setDeleteGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchGroups();
  }, [currentUser, navigate]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/reports');
  };


  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      setIsSubmitting(true);
      await createGroup(newGroupName);
      setNewGroupName('');
      setIsAddDialogOpen(false);
      await fetchGroups();
    } catch (error) {
      console.error('Error adding group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGroup = async () => {
    if (!editGroupId || !editGroupName.trim()) return;

    try {
      setIsSubmitting(true);
      await updateGroup(editGroupId, editGroupName);
      setEditGroupId(null);
      setEditGroupName('');
      setIsEditDialogOpen(false);
      await fetchGroups();
    } catch (error) {
      console.error('Error editing group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;

    try {
      setIsSubmitting(true);
      await deleteGroup(deleteGroupId);
      setDeleteGroupId(null);
      setDeleteGroupName('');
      setIsDeleteDialogOpen(false);
      await fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddDialog = () => {
    setNewGroupName('');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (group: GroupConfig) => {
    setEditGroupId(group.id);
    setEditGroupName(group.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (group: GroupConfig) => {
    setDeleteGroupId(group.id);
    setDeleteGroupName(group.name);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="Group Settings" />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Group Settings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            Back
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Group List</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={openAddDialog}
            >
              Add Group
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {groups.length === 0 ? (
            <Typography variant="body1" sx={{ my: 2, textAlign: 'center' }}>
              No groups found. Add a group to get started.
            </Typography>
          ) : (
            <List>
              {groups.map((group) => (
                <ListItem 
                  key={group.id}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" aria-label="edit" onClick={() => openEditDialog(group)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => openDeleteDialog(group)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                  divider
                >
                  <ListItemText 
                    primary={group.name} 
                    secondary={`Created: ${group.createdAt.toLocaleDateString()}`} 
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      {/* Add Group Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAddGroup} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Add Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleEditGroup} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the group "{deleteGroupName}"?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteGroup} variant="contained" color="error" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupSettings;