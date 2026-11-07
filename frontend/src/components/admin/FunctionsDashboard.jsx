// src/components/admin/FunctionsDashboard.jsx
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    Chip,
    Snackbar,
    Alert,
} from "@mui/material";
import FunctionForm from "./FunctionForm";
import { useFunctions } from "../../hooks/useFunctions";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import { useAuthContext } from "../../context/AuthProvider";

const FunctionsDashboard = () => {
    const [open, setOpen] = useState(false);
    const [editFunction, setEditFunction] = useState(null);
    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const { user } = useAuthContext();
    const {
        functions,
        isLoading,
        error,
        createMutation,
        updateMutation,
        deleteMutation,
    } = useFunctions();

    const showAlert = (message, severity = "success") =>
        setAlert({ open: true, message, severity });

    const handleSubmitFunction = (data) => {
        // 🔧 Guard: evita crash se o AuthProvider ainda não carregou
        if (!user) {
            showAlert("Debe iniciar sesión para realizar esta acción", "error");
            return;
        }

        // 🔧 crebyid/updbyid não são mais enviados: o backend usa req.user.EmpID
        if (editFunction) {
            updateMutation.mutate(
                { id: editFunction.funid, data },
                {
                    onSuccess: () => {
                        showAlert("Función actualizada con éxito");
                        setOpen(false);
                        setEditFunction(null);
                    },
                    onError: (err) =>
                        showAlert(
                            err?.response?.data?.error ||
                            err.message ||
                            "Error al actualizar la función",
                            "error"
                        ),
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    showAlert("Función creada con éxito");
                    setOpen(false);
                },
                onError: (err) =>
                    showAlert(
                        err?.response?.data?.error ||
                        err.message ||
                        "Error al crear la función",
                        "error"
                    ),
            });
        }
    };

    const handleDeactivateFunction = (id) => {
        deleteMutation.mutate(id, {
            onSuccess: () => showAlert("Función desactivada con éxito"),
            // 🔧 Optional chaining: evita crash em erro de rede (response ausente)
            onError: (err) =>
                showAlert(
                    err?.response?.data?.error ||
                    err.message ||
                    "Error al desactivar la función",
                    "error"
                ),
        });
    };

    if (isLoading) return <Typography>Cargando funciones...</Typography>;
    if (error)
        return (
            <Typography>Error al cargar funciones: {error.message}</Typography>
        );

    return (
        <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
            >
                <Typography variant="h6">Funciones</Typography>
                <Tooltip title="Agregar Función">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() => {
                            setEditFunction(null);
                            setOpen(true);
                        }}
                    >
                        Nueva Función
                    </Button>
                </Tooltip>
            </Box>

            <List>
                {functions.map((functionx) => (
                    <ListItem
                        key={functionx.funid}
                        sx={{ bgcolor: "white", mb: 1, borderRadius: 1, boxShadow: 1 }}
                    >
                        <ListItemText
                            primary={functionx.funnom}
                            secondary={
                                <Typography variant="body2" color="text.secondary">
                                    Descripción: {functionx.fundes || "—"}
                                </Typography>
                            }
                        />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label={functionx.estreg === "A" ? "Activa" : "Inactiva"}
                                color={functionx.estreg === "A" ? "success" : "error"}
                                size="small"
                            />
                            <Tooltip title="Editar">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setEditFunction(functionx);
                                        setOpen(true);
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            {functionx.estreg === "A" && (
                                <Tooltip title="Desactivar">
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleDeactivateFunction(functionx.funid)
                                        }
                                    >
                                        <BlockIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </ListItem>
                ))}
            </List>

            {open && (
                <FunctionForm
                    open={open}
                    handleClose={() => {
                        setOpen(false);
                        setEditFunction(null);
                    }}
                    onSubmit={handleSubmitFunction}
                    defaultValues={editFunction || {}}
                />
            )}

            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, open: false })}
                    severity={alert.severity}
                    sx={{ width: "100%" }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default FunctionsDashboard;