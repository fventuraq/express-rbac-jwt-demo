import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useFunctions } from '../../hooks/useFunctions';
import FunctionsDashboard from '../../components/admin/FunctionsDashboard';

const FuncionesPage = () => {
  const { functions, error, isLoading } = useFunctions();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error al carregar as funciones.</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <FunctionsDashboard
        functions={functions}
        onReorder={(newOrder) => {
          console.log('Nova orden de funciones:', newOrder);
        }}
      />
    </Box>
  );
};

export default FuncionesPage;