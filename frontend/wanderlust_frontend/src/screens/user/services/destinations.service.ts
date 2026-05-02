import apiClient from "../../../services/apiClient";

export interface Destination {
  dest_id: number;
  destName: string;
  image?: string;
  price: number;
  description?: string;
}

const userDestinationsService = {
  getAll: (q?: string) =>
    apiClient.get<Destination[]>("/destinations", { params: q ? { q } : undefined }),
  getById: (id: number) =>
    apiClient.get<Destination>(`/destinations/${id}`),
};

export default userDestinationsService;
