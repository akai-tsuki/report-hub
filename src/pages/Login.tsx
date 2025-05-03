import React from "react";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithGoogle } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      navigate("/reports");
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate("/reports");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Report Hub
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Sign in to access your reports
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{
                mt: 2,
                bgcolor: "#4285F4",
                "&:hover": {
                  bgcolor: "#357ae8",
                },
              }}
            >
              Sign in with Google
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;