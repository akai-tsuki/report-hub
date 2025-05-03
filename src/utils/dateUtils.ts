import { Timestamp } from "firebase/firestore";

export const formatDate = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }
  
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }
  
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (date: Date | Timestamp): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};