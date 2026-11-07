// src/hooks/useRoles.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFunctions,
  createFunction,
  updateFunction,
  deleteFunction,
} from "../api/adminService";

export const useFunctions = () => {
  const queryClient = useQueryClient();

  const {
    data: functions = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["functions"],
    queryFn: fetchFunctions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["functions"] });

  const createMutation = useMutation({
    mutationFn: createFunction,
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFunction(id, data),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteFunction,
    onSuccess: invalidate,
  });

  return {
    functions,
    error,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
