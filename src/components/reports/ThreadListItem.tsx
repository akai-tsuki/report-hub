import React from "react";
import { ListItem, ListItemText, Typography, Box } from "@mui/material";
import { ReportThread } from "../../types";

interface ThreadListItemProps {
  thread: ReportThread;
  onClick: () => void;
}

const ThreadListItem: React.FC<ThreadListItemProps> = ({ thread, onClick }) => {
  return (
    <ListItem
      alignItems="flex-start"
      button
      onClick={onClick}
      sx={{
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        borderRadius: 1,
      }}
    >
      <ListItemText
        primary={
          <Typography variant="h6" component="div">
            {thread.title}
          </Typography>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="textSecondary" component="span">
              Created by {thread.authorName} on{" "}
              {thread.createdAt.toLocaleDateString()} at{" "}
              {thread.createdAt.toLocaleTimeString()}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default ThreadListItem;