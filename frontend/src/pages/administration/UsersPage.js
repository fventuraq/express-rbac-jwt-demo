import React from "react";
import { Box, CircularProgress, Alert } from '@mui/material';
import { useUsers } from "../../hooks/useUsers";
import UsersDashboard from "../../components/administration/UsersDashboard.jsx";

const UsersPage = () => {
  const { users, error, isLoading } = useUsers();

  if (isLoading) return <CircularProgress />;
  if (error)
    return <Alert severity="error">Error em carregar os usuarios.</Alert>;
  return (
    <Box sx={{ p: 2 }}>
      <UsersDashboard
        users={users}
        onReorder={(newOrder) => {
          console.log("Nova orden de usuarios:", newOrder);
        }}
      />
    </Box>
  );
};

export default UsersPage;
