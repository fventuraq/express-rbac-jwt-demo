// src/hooks/useRoles.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRoles,
  createRol,
  updateRol,
  deleteRol,
} from "../api/adminService";

export const useRoles = () => {
  const queryClient = useQueryClient();

  const {
    data: roles = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["roles"] });

  const createMutation = useMutation({
    mutationFn: createRol,
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRol(id, data),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRol,
    onSuccess: invalidate,
  });

  return {
    roles,
    error,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
