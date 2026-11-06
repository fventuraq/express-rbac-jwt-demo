import React from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useRoles } from "../../hooks/useRoles";
import RolesDashboard from "../../components/admin/RolesDashboard";

const RolesPage = () => {
  const { roles, error, isLoading } = useRoles();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Erro al carregar os roles.</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <RolesDashboard
        roles={roles}
        onReorder={(newOrder) => {
          console.log("Nova orden de roles:", newOrder);
        }}
      />
    </Box>
  );
};

export default RolesPage;
