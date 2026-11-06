import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useViews} from '../../hooks/useViews';
import ViewsDashboard from '../../components/admin/ViewsDashboard';

const ViewsPage = () => {
  const { views, error, isLoading } = useViews();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error em carregar as telas.</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <ViewsDashboard
        views={views}
        onReorder={(newOrder) => {
          console.log('Nova orden de telas:', newOrder);
        }}
      />
    </Box>
  );
};

export default ViewsPage;