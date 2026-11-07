// src/components/admin/ViewForm.jsx
// Formulário de criação/edição de Views.
// Campos espelham a tabela VIEWS (VieNom, VieUrl, VieCtr, VieIco, VieEst, VieEstVis).
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";

const ViewForm = ({ open, handleClose, onSubmit, defaultValues = {} }) => {
  const { register, handleSubmit, reset } = useForm({ defaultValues });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data) => {
    // Normaliza booleanos opcionais
    onSubmit({
      vienom: data.vienom,
      vieurl: data.vieurl,
      viectr: data.viectr,
      vieico: data.vieico || null,
      vieest: data.vieest || "A",
      vieestvis: data.vieestvis ?? true,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {defaultValues?.vieid ? "Editar View" : "Crear View"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            {...register("vienom", { required: true })}
          />
          <TextField
            label="URL"
            fullWidth
            margin="normal"
            placeholder="/views"
            {...register("vieurl", { required: true })}
          />
          <TextField
            label="Controlador (componente)"
            fullWidth
            margin="normal"
            placeholder="ViewsPage"
            {...register("viectr", { required: true })}
          />
          <TextField
            label="Icono (nombre en ICONS)"
            fullWidth
            margin="normal"
            placeholder="ViewsIco"
            {...register("vieico")}
          />
          <TextField
            select
            label="Estado"
            fullWidth
            margin="normal"
            defaultValue={defaultValues?.vieest || "A"}
            {...register("vieest")}
          > 
            <MenuItem value="A">Activo</MenuItem>
            <MenuItem value="I">Inactivo</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                defaultChecked={defaultValues?.vieestvis ?? true}
                {...register("vieestvis")}
              />
            }
            label="Visible en el menú"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {defaultValues?.vieid ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ViewForm;