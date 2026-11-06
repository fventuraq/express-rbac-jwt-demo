import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./components/Sidebar";
import PrivateRoute from "./routes/PrivateRoute";

import { AuthProvider, useAuthContext } from "./context/AuthProvider";

// Import de todos os componentes
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import viewsPage from "./pages/admin/viewsPage";
import FuncionesPage from "./pages/admin/FuncionesPage";
import RolesPage from "./pages/admin/RolesPage";
import PersonsPage from "./pages/administration/PersonsPage";
import UsersPage from "./pages/administration/UsersPage";

// 🔹 Mapeo de TODOS los componentes disponibles
const componentesDisponibles = {
    Dashboard,
    viewsPage,
    FuncionesPage,
    RolesPage,
    PersonsPage,
    UsersPage,
};

function AppContent() {
    //const { user, menu } = useAuthContext();
    const { user, menu = [], loading } = useAuthContext();
    const [drawerOpen, setDrawerOpen] = useState(true);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const drawerWidth = isSmallScreen ? 0 : 260;

    const contentPadding = {
        xs: 1,
        sm: 1.5,
        md: 2,
        lg: 2.5,
    };

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }} />
            </ThemeProvider>
        );
    }

    if (!user) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>

                {user && <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />}

                {/*<Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: user ? "240px" : "0px" }}>*/}
                <Box component="main"
                    sx={{
                        flexGrow: 1,
                        p: contentPadding,
                        transition: theme.transitions.create(["margin", "width"], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        marginLeft: drawerOpen && !isSmallScreen ? `${drawerWidth}px` : 0,
                        width: drawerOpen && !isSmallScreen ? `calc(100% - ${drawerWidth}px)` : "100%",
                        overflowX: "auto",
                        minHeight: "100vh",
                        "& > *": {
                            maxWidth: "100%",
                        },
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            {menu.flatMap((funcion) =>
                                funcion.views.map((view) => {
                                    const Componente = componentesDisponibles[view.VenCtr];
                                    return Componente ? (
                                        <Route key={view.VenID} path={view.VenURL} element={<Componente />} />
                                    ) : null;
                                })
                            )}
                        </Route>
                    </Routes>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;