// src/components/admin/FunctionForm.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions,
    Box, Paper, Typography, IconButton,
} from "@mui/material";
import { useViews } from "../../hooks/useViews";   // 🔁 antes: useWindows
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const FunctionForm = ({ open, handleClose, onSubmit, defaultValues = {} }) => {
    const { views: allViews } = useViews();          // 🔁 antes: windows
    const { register, handleSubmit, reset } = useForm({ defaultValues });

    const [associated, setAssociated] = useState([]);
    const [available, setAvailable] = useState([]);

    useEffect(() => {
        if (!open) return;
        reset(defaultValues);

        const asociadas = Array.isArray(defaultValues?.ventanas)
            ? defaultValues.ventanas
                .filter((id) => id != null)
                .map((id) => allViews?.find((v) => v.vieid === id))   // 🔁 vieid
                .filter(Boolean)
            : [];

        setAssociated(asociadas);
        setAvailable(
            allViews ? allViews.filter((v) => !asociadas.some((a) => a.vieid === v.vieid)) : []
        );
    }, [open, defaultValues, reset, allViews]);

    const handleFormClose = () => { reset(); handleClose(); };

    const handleAdd = (id) => {
        const item = available.find((v) => v.vieid === id);
        if (!item) return;
        setAssociated((prev) => [...prev, item]);
        setAvailable((prev) => prev.filter((v) => v.vieid !== id));
    };

    const handleRemove = (id) => {
        const item = associated.find((v) => v.vieid === id);
        if (!item) return;
        setAvailable((prev) => [...prev, item]);
        setAssociated((prev) => prev.filter((v) => v.vieid !== id));
    };

    const handleFormSubmit = (data) => {
        if (associated.length === 0) {
            alert("Debe asociar al menos una view para crear la función.");
            return;
        }
        onSubmit({ ...data, ventanas: associated.map((v) => v.vieid) });
    };

    return (
        <Dialog open={open} onClose={handleFormClose} fullWidth maxWidth="md">
            <DialogTitle>
                {defaultValues?.funid ? "Editar Función" : "Crear Función"}
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <TextField label="Nombre de la Función" fullWidth margin="normal" {...register("funnom")} />
                    <TextField label="Descripción de la Función" fullWidth margin="normal" {...register("fundes")} />

                    <Box display="flex" gap={2} mt={2}>
                        <Paper sx={{ flex: 1, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 3 }}>
                            <Typography variant="h6" gutterBottom>Views Asociadas</Typography>
                            {associated.map((v) => (
                                <Box key={v.vieid} display="flex" justifyContent="space-between" alignItems="center"
                                    sx={{ p: 1, mb: 1, borderRadius: 2, backgroundColor: "#fff", boxShadow: 1 }}>
                                    <Typography>{v.vienom}</Typography>
                                    <IconButton color="error" onClick={() => handleRemove(v.vieid)}>
                                        <RemoveCircleIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Paper>

                        <Paper sx={{ flex: 1, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 3 }}>
                            <Typography variant="h6" gutterBottom>Views Disponibles</Typography>
                            {available.map((v) => (
                                <Box key={v.vieid} display="flex" justifyContent="space-between" alignItems="center"
                                    sx={{ p: 1, mb: 1, borderRadius: 2, backgroundColor: "#fff", boxShadow: 1 }}>
                                    <Typography>{v.vienom}</Typography>
                                    <IconButton color="primary" onClick={() => handleAdd(v.vieid)}>
                                        <AddCircleIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleFormClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">
                        {defaultValues?.funid ? "Actualizar" : "Guardar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FunctionForm;