// src/components/admin/RoleForm.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions,
    Box, Paper, Typography, IconButton,
} from "@mui/material";
import { useFunctions } from "../../hooks/useFunctions";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const RoleForm = ({ open, handleClose, onSubmit, defaultValues = {} }) => {
    const { functions: allFuncs } = useFunctions();
    const { register, handleSubmit, reset } = useForm({ defaultValues });

    const [associated, setAssociated] = useState([]);
    const [available, setAvailable] = useState([]);

    useEffect(() => {
        if (!open) return;
        reset(defaultValues);

        const asociadas = Array.isArray(defaultValues?.funcs)
            ? defaultValues.funcs
                .filter((id) => id != null)
                .map((id) => allFuncs?.find((f) => f.funid === id))
                .filter(Boolean)
            : [];

        setAssociated(asociadas);
        setAvailable(allFuncs ? allFuncs.filter((f) => !asociadas.some((a) => a.funid === f.funid)) : []);
    }, [open, defaultValues, reset, allFuncs]);

    const handleFormClose = () => { reset(); handleClose(); };

    const handleAdd = (id) => {
        const item = available.find((f) => f.funid === id);
        if (!item) return;
        setAssociated((p) => [...p, item]);
        setAvailable((p) => p.filter((f) => f.funid !== id));
    };

    const handleRemove = (id) => {
        const item = associated.find((f) => f.funid === id);
        if (!item) return;
        setAvailable((p) => [...p, item]);
        setAssociated((p) => p.filter((f) => f.funid !== id));
    };

    const handleFormSubmit = (data) => {
        if (associated.length === 0) {
            alert("Debe asociar al menos una función al rol.");
            return;
        }
        onSubmit({ ...data, funcs: associated.map((f) => f.funid) });
    };

    return (
        <Dialog open={open} onClose={handleFormClose} fullWidth maxWidth="md">
            <DialogTitle>
                {defaultValues?.rolid ? "Editar Rol" : "Crear Rol"}
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <TextField label="Nombre del Rol" fullWidth margin="normal" {...register("rolnom")} />

                    <Box display="flex" gap={2} mt={2}>
                        <Paper sx={{ flex: 1, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 3 }}>
                            <Typography variant="h6" gutterBottom>Funciones Asociadas</Typography>
                            {associated.map((f) => (
                                <Box key={f.funid} display="flex" justifyContent="space-between" alignItems="center"
                                    sx={{ p: 1, mb: 1, borderRadius: 2, backgroundColor: "#fff", boxShadow: 1 }}>
                                    <Typography>{f.funnom}</Typography>
                                    <IconButton color="error" onClick={() => handleRemove(f.funid)}>
                                        <RemoveCircleIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Paper>

                        <Paper sx={{ flex: 1, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 3 }}>
                            <Typography variant="h6" gutterBottom>Funciones Disponibles</Typography>
                            {available.map((f) => (
                                <Box key={f.funid} display="flex" justifyContent="space-between" alignItems="center"
                                    sx={{ p: 1, mb: 1, borderRadius: 2, backgroundColor: "#fff", boxShadow: 1 }}>
                                    <Typography>{f.funnom}</Typography>
                                    <IconButton color="primary" onClick={() => handleAdd(f.funid)}>
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
                        {defaultValues?.rolid ? "Actualizar" : "Guardar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default RoleForm;