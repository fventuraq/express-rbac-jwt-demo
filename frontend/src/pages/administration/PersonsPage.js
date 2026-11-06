import React from "react";
import { Box, CircularProgress, Alert } from '@mui/material';
import { usePersons } from "../../hooks/usePersons";
import PersonsDashboard from "../../components/administration/PersonsDashboard.jsx";

const PersonasPage = () => {
  const { persons, error, isLoading } = usePersons();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error em carregar as pessoas.</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <PersonsDashboard
        persons={persons}
        onReorder={(newOrder) => {
          console.log("Nova orden de pessoas:", newOrder);
        }}
      />
    </Box>
  );
};

export default PersonasPage;
