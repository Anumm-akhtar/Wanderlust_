import apiClient from "../../../services/apiClient";

export interface Destination {
  dest_id: number;
  destName: string;
  image?: string;
  price: number;
  description?: string;
}

export interface DestinationCreate {
  destName: string;
  price: number;
  image?: string;
  description?: string;
}

export interface DestinationUpdate {
  destName?: string;
  price?: number;
  image?: string;
  description?: string;
}

const destinationsService = {
  getAll: (q?: string) =>
    apiClient.get<Destination[]>("/destinations", { params: q ? { q } : undefined }),
  getById: (id: number) =>
    apiClient.get<Destination>(`/destinations/${id}`),
  create: (data: DestinationCreate) =>
    apiClient.post<Destination>("/destinations", data),
  update: (id: number, data: DestinationUpdate) =>
    apiClient.put<Destination>(`/destinations/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/destinations/${id}`),
};

export default destinationsService;
