import React from "react";
import { Box, Paper, Typography, Button, Divider } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { ReportPostWithChildren } from "../../types";

interface PostTreeProps {
  posts: ReportPostWithChildren[];
  level: number;
  onReplyClick: (postId: string) => void;
}

const PostTree: React.FC<PostTreeProps> = ({ posts, level, onReplyClick }) => {
  const marginLeft = level * 24;

  return (
    <Box>
      {posts.map((post, index) => (
        <Box
          key={post.id}
          sx={{
            ml: `${marginLeft}px`,
            mb: 2,
            position: "relative",
            "&::before": level > 0 ? {
              content: '""',
              position: "absolute",
              left: "-12px",
              top: "0",
              bottom: "0",
              width: "2px",
              background: (theme) => theme.palette.divider,
            } : {},
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderLeft: (theme) => `4px solid ${
                level % 3 === 0
                  ? theme.palette.primary.main
                  : level % 3 === 1
                  ? theme.palette.secondary.main
                  : theme.palette.info.main
              }`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {post.authorName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {post.createdAt.toLocaleDateString()} at{" "}
                {post.createdAt.toLocaleTimeString()}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {post.content}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => onReplyClick(post.id)}
            >
              Reply
            </Button>
          </Paper>

          {post.children.length > 0 && (
            <PostTree
              posts={post.children}
              level={level + 1}
              onReplyClick={onReplyClick}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default PostTree;