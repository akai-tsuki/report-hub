import React from 'react';
import { Box, Paper, Typography, Button, Divider, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplyIcon from '@mui/icons-material/Reply';
import { ReportPost } from '../../types';
import { formatPostTitle, formatPostAuthorInfo } from '../../utils/formatUtils';

interface PostDetailProps {
  post: ReportPost;
  onBack: () => void;
  onReply: (postId: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack, onReply }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          投稿詳細
        </Typography>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        {/* タイトルがある場合は表示 */}
        {post.title && (
          <Typography variant="h5" component="h2" gutterBottom>
            {formatPostTitle(post)}
          </Typography>
        )}
        
        {/* 投稿者情報 */}
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
          {formatPostAuthorInfo(post)}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* 内容 */}
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
          {post.content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<ReplyIcon />}
            onClick={() => onReply(post.id)}
            color="primary"
          >
            返信する
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PostDetail;