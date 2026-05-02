import apiClient from "../../../services/apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ph_num?: string;
  addr?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    const params = new URLSearchParams();
    params.append("username", credentials.email);
    params.append("password", credentials.password);

    const response = await apiClient.post("/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  register: async (data: RegisterPayload) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  registerAuthor: async (data: RegisterPayload) => {
    const params = new URLSearchParams();
    params.append("email", data.email);
    params.append("password", data.password);
    params.append("firstName", data.firstName);
    params.append("lastName", data.lastName);

    const response = await apiClient.post("/auth/author/register", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
  },

  getToken: () => {
    return localStorage.getItem("access_token");
  },

  setToken: (token: string) => {
    localStorage.setItem("access_token", token);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },
};
