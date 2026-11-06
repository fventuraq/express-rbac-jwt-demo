// components/Sidebar.js
import React, { useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  IconButton,
  useMediaQuery,
  Avatar,
  Typography,
  Collapse,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Home from "@mui/icons-material/Home";
import { useTheme } from "@mui/material/styles";

const Sidebar = ({ drawerOpen, setDrawerOpen }) => {
  const theme = useTheme();
  // `menu` deve ser um array de grupos:
  //   [{ funid, funnom, ventanas: [{ venid, vennom, venurl, venico, venestvis }] }]
  const { user, menu, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});

  if (!user || location.pathname === "/login") return null;

  const handleSubmenuToggle = (funnom) => {
    setOpenSubmenus((prev) => ({ ...prev, [funnom]: !prev[funnom] }));
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#0A1929",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
            RBAC Demo
          </Typography>
        </Box>
      </Box>

      {/* Perfil del usuario */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
          {/* ⚠️ Ajusta si el AuthProvider devuelve otro campo (ej: user.usunam) */}
          {user?.NomUsu?.charAt(0).toUpperCase() || "U"}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
            {user?.NomUsu}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {user?.EmpCargo || "Usuario"}
          </Typography>
        </Box>
        {!isSmallScreen && (
          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            sx={{ color: "white" }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Menú dinámico */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List component="nav" sx={{ px: 1 }}>
          {/* INICIO (siempre visible) */}
          <ListItemButton
            onClick={() => {
              navigate("/dashboard");
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor:
                location.pathname === "/dashboard"
                  ? "rgba(25, 118, 210, 0.2)"
                  : "transparent",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
                transform: "translateX(4px)",
              },
              transition: "all 0.2s",
              position: "relative",
              "&::before":
                location.pathname === "/dashboard"
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      height: "60%",
                      width: 3,
                      bgcolor: "#1976d2",
                      borderRadius: 2,
                    }
                  : {},
            }}
          >
            <Home
              sx={{
                mr: 2,
                fontSize: 20,
                color:
                  location.pathname === "/dashboard"
                    ? "#1976d2"
                    : "rgba(255,255,255,0.7)",
              }}
            />
            <ListItemText
              primary="Inicio"
              primaryTypographyProps={{
                sx: {
                  color:
                    location.pathname === "/dashboard"
                      ? "#1976d2"
                      : "rgba(255,255,255,0.8)",
                  fontWeight: location.pathname === "/dashboard" ? 600 : 400,
                  fontSize: "0.85rem",
                },
              }}
            />
          </ListItemButton>

          <Box sx={{ height: 1, bgcolor: "rgba(255,255,255,0.1)", my: 1 }} />

          {/* Grupos del sistema (SISTEMA, DADOS...) */}
          {menu.map((funcion) => {
            const isOpen = openSubmenus[funcion.funnom];
            const hasVentanas =
              funcion.ventanas?.filter((v) => v.venestvis !== false).length > 0;

            if (!hasVentanas) return null;

            return (
              <Box key={funcion.funnom}>
                <ListItemButton
                  onClick={() => handleSubmenuToggle(funcion.funnom)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <ListItemText
                    primary={funcion.funnom}
                    primaryTypographyProps={{
                      sx: {
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      },
                    }}
                  />
                  {isOpen ? (
                    <ExpandLess sx={{ color: "white" }} />
                  ) : (
                    <ExpandMore sx={{ color: "white" }} />
                  )}
                </ListItemButton>

                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {funcion.ventanas
                      .filter((v) => v.venestvis !== false)
                      .map((ventana) => {
                        const isActive = location.pathname === ventana.venurl;

                        return (
                          <ListItem key={ventana.venid} disablePadding>
                            <Tooltip
                              title={ventana.vennom}
                              placement="right"
                              arrow
                            >
                              <ListItemButton
                                onClick={() => {
                                  navigate(ventana.venurl);
                                  if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                  pl: 4,
                                  borderRadius: 2,
                                  mb: 0.5,
                                  bgcolor: isActive
                                    ? "rgba(25, 118, 210, 0.2)"
                                    : "transparent",
                                  "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    transform: "translateX(4px)",
                                  },
                                  transition: "all 0.2s",
                                  position: "relative",
                                  "&::before": isActive
                                    ? {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: "20%",
                                        height: "60%",
                                        width: 3,
                                        bgcolor: "#1976d2",
                                        borderRadius: 2,
                                      }
                                    : {},
                                }}
                              >
                                <ListItemText
                                  primary={ventana.vennom}
                                  primaryTypographyProps={{
                                    sx: {
                                      color: isActive
                                        ? "#1976d2"
                                        : "rgba(255,255,255,0.8)",
                                      fontSize: "0.85rem",
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </Tooltip>
                          </ListItem>
                        );
                      })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Cerrar sesión */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 1 }}>
        <ListItemButton
          onClick={() => {
            logout();
            navigate("/login");
          }}
          sx={{
            borderRadius: 2,
            "&:hover": { bgcolor: "#d32f2f" },
          }}
        >
          <ExitToAppIcon sx={{ mr: 2, color: "rgba(255,255,255,0.7)" }} />
          <ListItemText
            primary="Cerrar Sesión"
            primaryTypographyProps={{
              sx: { color: "rgba(255,255,255,0.8)", fontWeight: 500 },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: "#0A1929",
            color: "white",
            "&:hover": { bgcolor: "#1976d2" },
            boxShadow: 3,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {!isSmallScreen && !drawerOpen && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "fixed",
            top: 80,
            left: 16,
            zIndex: 1300,
            bgcolor: "#0A1929",
            color: "white",
            "&:hover": { bgcolor: "#1976d2" },
            boxShadow: 3,
            transition: "all 0.2s",
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      <Drawer
        variant={isSmallScreen ? "temporary" : "persistent"}
        open={isSmallScreen ? mobileOpen : drawerOpen}
        onClose={() => setMobileOpen(false)}
        anchor="left"
        ModalProps={{ keepMounted: true }}
        sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            bgcolor: "#0A1929",
            borderRight: "none",
            boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
