// pages/Login.js
import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  PersonOutline,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Business,
  Security,
} from "@mui/icons-material";

const Login = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [usser, setUsser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    login(
      { NomUsu: usser, Pas: password },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (error) => {
          setError(error.response?.data?.error || "Error en el inicio de sesión");
          setLoading(false);
        },
      }
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          // 🔹 REDUCIDO: De 0.85 a 0.6 de opacidad y blur de 8px a 2px
          background: "linear-gradient(135deg, rgba(9, 0, 48, 0.6) 0%, rgba(44, 62, 80, 0.7) 100%)",
          backdropFilter: "blur(2px)",
          zIndex: 1,
        },
      }}
    >
      <Fade in={isVisible} timeout={800}>
        <Paper
          elevation={24}
          sx={{
            position: "relative",
            zIndex: 2,
            p: { xs: 3, sm: 4, md: 5 },
            width: "100%",
            maxWidth: 450,
            borderRadius: 4,
            background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <Box
            component="img"
            alt="Logo algo"
            sx={{
              mb: 3,
              width: { xs: 100, sm: 130, md: 160 },
              height: "auto",
              mx: "auto",
              display: "block",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.05)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #090030 0%, #2C3E50 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Bienvenido
          </Typography>

          <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
            Inicie sesión para acceder al sistema
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              value={usser}
              onChange={(e) => setUsser(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 0 0 2px rgba(9, 0, 48, 0.1)",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 0 0 2px rgba(9, 0, 48, 0.1)",
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg, #090030 0%, #2C3E50 100%)",
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(9, 0, 48, 0.3)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <LoginIcon />
                  <span>Ingresar</span>
                </Stack>
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Business sx={{ fontSize: 12, color: "#666" }} />
                <Typography variant="caption" color="text.secondary">
                  Molissa Transportes
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Security sx={{ fontSize: 12, color: "#666" }} />
                <Typography variant="caption" color="text.secondary">
                  Sistema Seguro
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;