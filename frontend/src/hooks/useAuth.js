import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginUser, logoutUser, fetchMenu } from '../api/authService';
import { useState, useEffect } from 'react';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ Para evitar problemas de redirección antes de cargar

    // 🔹 Restaurar usuario, token y menú desde localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedMenu = localStorage.getItem('menu');

        if (storedToken && storedUser) {

            if (isTokenExpired(storedToken)) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("menu");
                setUser(null);
                setToken(null);
                setMenu([]);
            } else {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setMenu(storedMenu ? JSON.parse(storedMenu) : []);
            }
        }
        setLoading(false); // ✅ Se detiene la carga después de verificar los datos
    }, []);

    // ✅ Mutación para login
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setUser(data.user);
            setToken(data.token);
            setMenu(data.menu);

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            localStorage.setItem("menu", JSON.stringify(data.menu));

            queryClient.setQueryData(["menu"], data.menu);
        },
        onError: (error) => {
            console.error("Error en login:", error.response?.data?.error || "Error desconocido");
        }
    });

    // ✅ Mutación para logout
    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            setUser(null);
            setToken(null);
            setMenu([]);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("menu");
            queryClient.removeQueries(['menu']);
        },
    });

    // ✅ Query para obtener el menú dinámico
    const { data: fetchedMenu = [], isLoading: isLoadingMenu } = useQuery({
        queryKey: ['menu'],
        queryFn: fetchMenu,
        enabled: !!token, // Solo ejecuta si hay un token
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            setMenu(data);
            localStorage.setItem("menu", JSON.stringify(data)); // ✅ Asegurar que `menu` se guarda correctamente
        },
    });

    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));            
            return Date.now() >= payload.exp * 1000;
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return true; // Si falla el decode, asumimos que está expirado
        }
    };

    return {
        user,
        token,
        menu,
        loading, // ✅ Se usa en `PrivateRoute` para evitar redirecciones prematuras
        isLoadingMenu,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
    };
};