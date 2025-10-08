
useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error: unknown) => {
        const axiosError = error as AxiosError;
        const originalRequest = axiosError.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

        // temporal for debugging
        if (axiosError.config?.url?.includes("/refresh-token")) {
          console.warn("Prevented infinite loop on refresh-token");
          return Promise.reject(error);
        }
        
        if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.post("/api/auth/refresh-token");
            if (data.success) {
              setAccessToken(data.accessToken);
            
              if (authUser) {
                socket?.disconnect();
                connectSocket(authUser, data.accessToken);
              }

              return axios({
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${data.accessToken}`
                }
              });
            }
          } catch (refreshError) {
            await logout();
            toast.error("Session expired. Please login again.");
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authUser]);