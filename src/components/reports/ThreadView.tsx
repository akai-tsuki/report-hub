import React from 'react';
import { Box, Typography, Button, Paper, Divider, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ReportThread, ReportPostWithChildren, PriorityLevel } from '../../types';
import PostTree from './PostTree';
import { formatDate, formatPriority, formatThreadListItem } from '../../utils/formatUtils';

interface ThreadViewProps {
  thread: ReportThread;
  rootPost: ReportPostWithChildren;
  onBack: () => void;
  onReplyClick: (postId: string) => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({ 
  thread, 
  rootPost, 
  onBack,
  onReplyClick
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          スレッド表示
        </Typography>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 3,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          {thread.title}
        </Typography>
        
        <Typography variant="subtitle2" color="textSecondary">
          {formatThreadListItem(thread, rootPost.priority as PriorityLevel)}
        </Typography>
      </Paper>

      {/* ルート投稿から再帰的にすべての投稿を表示 */}
      <Box sx={{ mt: 2 }}>
        <PostTree
          posts={[rootPost]}
          level={0}
          onReplyClick={onReplyClick}
        />
      </Box>
    </Box>
  );
};

export default ThreadView;