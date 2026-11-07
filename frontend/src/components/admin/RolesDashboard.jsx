// src/components/admin/RolesDashboard.jsx
import React, { useState } from "react";
import {
    Box, Typography, Paper, Button, IconButton, Tooltip,
    List, ListItem, ListItemText, Chip, Snackbar, Alert,
} from "@mui/material";
import RoleForm from "./RoleForm";
import { useRoles } from "../../hooks/useRoles";
import { useFunctions } from "../../hooks/useFunctions";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";

const RolesDashboard = () => {
    const [open, setOpen] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const { roles, isLoading, error, createMutation, updateMutation, deleteMutation } = useRoles();
    const { functions } = useFunctions();          // para traduzir funid → funnom

    const showAlert = (message, severity = "success") =>
        setAlert({ open: true, message, severity });

    const handleSubmit = (data) => {
        if (editRole) {
            updateMutation.mutate(
                { id: editRole.rolid, data },
                {
                    onSuccess: () => { showAlert("Rol actualizado con éxito"); setOpen(false); setEditRole(null); },
                    onError: (e) => showAlert(e?.response?.data?.error || "Error al actualizar rol", "error"),
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => { showAlert("Rol creado con éxito"); setOpen(false); },
                onError: (e) => showAlert(e?.response?.data?.error || "Error al crear rol", "error"),
            });
        }
    };

    const handleDeactivate = (id) => {
        deleteMutation.mutate(id, {
            onSuccess: () => showAlert("Rol desactivado con éxito"),
            onError: (e) => showAlert(e?.response?.data?.error || "Error al desactivar rol", "error"),
        });
    };

    const getFuncNames = (ids) =>
        (ids || [])
            .map((id) => functions.find((f) => f.funid === id)?.funnom)
            .filter(Boolean);

    if (isLoading) return <Typography>Cargando roles...</Typography>;
    if (error) return <Typography>Error al cargar roles: {error.message}</Typography>;

    return (
        <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Roles</Typography>
                <Tooltip title="Agregar Rol">
                    <Button variant="contained" startIcon={<AddIcon />} size="small"
                        onClick={() => { setEditRole(null); setOpen(true); }}>
                        Nuevo Rol
                    </Button>
                </Tooltip>
            </Box>

            <List>
                {roles.map((role) => (
                    <ListItem key={role.rolid} sx={{ bgcolor: "white", mb: 1, borderRadius: 1, boxShadow: 1 }}>
                        <ListItemText
                            primary={role.rolnom}
                            secondary={`Funciones: ${getFuncNames(role.funcs).join(", ") || "—"}`}
                        />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label={role.estreg === "A" ? "Activo" : "Inactivo"}
                                color={role.estreg === "A" ? "success" : "error"}
                                size="small"
                            />
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => { setEditRole(role); setOpen(true); }}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            {role.estreg === "A" && (
                                <Tooltip title="Desactivar">
                                    <IconButton size="small" onClick={() => handleDeactivate(role.rolid)}>
                                        <BlockIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </ListItem>
                ))}
            </List>

            {open && (
                <RoleForm
                    open={open}
                    handleClose={() => { setOpen(false); setEditRole(null); }}
                    onSubmit={handleSubmit}
                    defaultValues={editRole || {}}
                />
            )}

            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: "100%" }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default RolesDashboard;