import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchViews, createView, updateView, deleteView } from '../api/adminService';

export const useViews = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['views'],
    queryFn: fetchViews,
  });

  const createMutation = useMutation({
    mutationFn: createView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['views'] });
    },
  });

  const updateMutation = useMutation({    
    mutationFn: ({ id, data }) => updateView(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['views'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['views'] });
    },
  });

  return {
    views: data,
    error,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};