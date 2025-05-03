import React from "react";
import { ListItem, ListItemText, Typography, Box } from "@mui/material";
import { ReportThread } from "../../types";
import { formatThreadListItem } from "../../utils/formatUtils";

interface ThreadListItemProps {
  thread: ReportThread;
  onClick: () => void;
}

const ThreadListItem: React.FC<ThreadListItemProps> = ({ thread, onClick }) => {
  return (
    <ListItem
      alignItems="center"
      onClick={onClick}
      sx={{
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        borderRadius: 1,
        cursor: 'pointer',
        p: 1
      }}
    >
      <ListItemText
        primary={
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              fontWeight: 'medium',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {formatThreadListItem(thread)}
          </Typography>
        }
      />
    </ListItem>
  );
};

export default ThreadListItem;