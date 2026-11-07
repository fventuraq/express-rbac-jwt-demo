// pages/Dashboard.js
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Avatar, useTheme, alpha, Fade, Grow, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import {
  TrendingUp,
  People,
  LocalShipping,
  Assessment,
  WavingHand,
} from "@mui/icons-material";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthContext();
  const [loaded, setLoaded] = useState(false);

  const menu = JSON.parse(localStorage.getItem("menu")) || [];
  const views = menu.flatMap((f) => f.views || []).filter((v) => v.vieestvis !== false);

  const cardColors = [
    { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  ];

  useEffect(() => {
    setLoaded(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.05
        )} 100%)`,
        p: { xs: 2, sm: 3, md: 4 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Fondo decorativo */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, maxWidth: "1400px", mx: "auto" }}>
        <Fade in={loaded} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #090030 0%, #2C3E50 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WavingHand sx={{ fontSize: 40, color: "#090030" }} />
              {getGreeting()}, {user?.NomUsu || "Usuario"}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Welcome to the control panel. Select an option to continue.
            </Typography>
          </Box>
        </Fade>        

        {/* Módulos disponibles - Usando iconos dinámicos */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#090030" }}>
          Módulos Disponibles
        </Typography>

        <Grid container spacing={2}>
          {views.map((v, idx) => {
            //const IconComponent = getIconByName(v.VieIco);
            const cardColor = cardColors[idx % cardColors.length];

            return (
              <Grow in={loaded} timeout={(idx + 1) * 100} key={v.vieid}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                      },
                    }}
                    onClick={() => navigate(v.vieurl)}
                  >
                    <CardActionArea>
                      <Box
                        sx={{
                          height: 140,
                          background: cardColor.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: "rgba(255,255,255,0.9)",
                            color: "#090030",
                          }}
                        >
                          {/*<IconComponent />*/}
                        </Avatar>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center" }}>
                          {v.vienom}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grow>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;