import apiClient from "../../../services/apiClient";
import type { Destination } from "./destinations.service";

export interface Package {
  pkg_id: number;
  name: string;
  image?: string;
  price: number;
  description?: string;
}

const userPackagesService = {
  getAll: () => apiClient.get<Package[]>("/packages"),
  getById: (id: number) => apiClient.get<Package>(`/packages/${id}`),
  getDestinations: (pkgId: number) =>
    apiClient.get<Destination[]>(`/packages/${pkgId}/destinations`),
};

export default userPackagesService;
