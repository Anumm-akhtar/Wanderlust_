import apiClient from "../../../services/apiClient";

export interface Package {
  pkg_id: number;
  name: string;
  image?: string;
  price: number;
  description?: string;
}

export interface PackageCreate {
  name: string;
  price: number;
  image?: string;
  description?: string;
}

export interface PackageUpdate {
  name?: string;
  price?: number;
  image?: string;
  description?: string;
}

const packagesService = {
  getAll: () =>
    apiClient.get<Package[]>("/packages"),
  getById: (id: number) =>
    apiClient.get<Package>(`/packages/${id}`),
  create: (data: PackageCreate) =>
    apiClient.post<Package>("/packages", data),
  update: (id: number, data: PackageUpdate) =>
    apiClient.put<Package>(`/packages/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/packages/${id}`),
  addDestination: (pkgId: number, destId: number) =>
    apiClient.post(`/packages/${pkgId}/destinations/${destId}`),
  removeDestination: (pkgId: number, destId: number) =>
    apiClient.delete(`/packages/${pkgId}/destinations/${destId}`),
  getDestinations: (pkgId: number) =>
    apiClient.get<import("./destinations.service").Destination[]>(
      `/packages/${pkgId}/destinations`,
    ),
};

export default packagesService;
