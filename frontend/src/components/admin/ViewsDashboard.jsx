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
import ViewForm from "./ViewForm";
import { useViews } from "../../hooks/useViews";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import { useAuthContext } from "../../context/AuthProvider";

const ViewsDashboard = () => {
  console.log('Entre al dashboard de >Views')
  const [open, setOpen] = useState(false);
  const [editView, setEditView] = useState(null); // Estado para edición
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const { user } = useAuthContext();
  const { views, isLoading, error, createMutation, updateMutation, deleteMutation } = useViews();

  // Mostrar mensaje de alerta
  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // Función para manejar la creación o edición
  const handleSubmitView = (data) => {

    if (!user) {
      showAlert("Debe iniciar sesión para realizar esta acción", "error");
      return;
    }

    if (editView) {
      updateMutation.mutate(
        { id: editView.vieid, data: { ...data, updbyid: user.EmpID } },
        {
          onSuccess: () => {
            showAlert("View atualizada com sucesso");
            setOpen(false);
            setEditView(null);
          },
          onError: (error) => {
            showAlert(error.message || "Error na atualizacao da view", "error");
          },
        }
      );
    } else {
      data.crebyid = user.EmpID;
      createMutation.mutate(data, {
        onSuccess: () => {
          showAlert("View criada com sucesso");
          setOpen(false);
        },
        onError: (error) => {
          showAlert(error.message || "Erro al criar la view", "error");
        },
      });
    }
  };

  const handleDeactivateView = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => showAlert("View inativada com sucesso"),
      onError: (error) => showAlert(error.response.data.error || "Erro al inativar a view", "error"),
    });
  };

  if (isLoading) return <Typography>Carregando views...</Typography>;
  if (error) return <Typography>Erro al carregar views: {error.message}</Typography>;

  return (
    <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Views</Typography>
        <Tooltip title="Add View">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              setEditView(null);
              setOpen(true);
            }}
          >
            Nova View
          </Button>
        </Tooltip>
      </Box>

      {/* Lista de Views */}
      <List>
        {views.map((view) => (
          <ListItem
            key={view.vieid}
            sx={{ bgcolor: "white", mb: 1, borderRadius: 1, boxShadow: 1 }}
          >
            <ListItemText
              primary={view.vienom}
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    URL: {view.vieurl}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Controller: {view.viectr}
                  </Typography>
                </>
              }
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={view.vieest === "A" ? "Activa" : "Inactiva"}
                color={view.vieest === "A" ? "success" : "error"}
                size="small"
              />
              {/* Botón para editar */}
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditView(view);
                    setOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>

              {view.vieest === "A" && (
                <Tooltip title="Desactivar">
                  <IconButton
                    size="small"
                    onClick={() => handleDeactivateView(view.vieid)}
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
        <ViewForm
          open={open}
          handleClose={() => {
            setOpen(false);
            setEditView(null);
          }}
          onSubmit={handleSubmitView}
          defaultValues={editView || {}}
        />
      )}

      {/* Notificaciones */}
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

export default ViewsDashboard;
