import apiClient from "../../../services/apiClient";
import type { Destination } from "./destinations.service";

export interface Itinerary {
  itinerary_id: number;
  user_id: number;
  itinerary_name?: string;
  price?: number;
}

export interface ItineraryDetails {
  itinerary: Itinerary;
  destinations: Destination[];
}

export interface ItineraryCreate {
  itinerary_name: string;
}

export interface AddDestinationRequest {
  dest_id: number;
  itinerary_id?: number;
  new_itinerary_name?: string;
}

const itinerariesService = {
  list: () => apiClient.get<Itinerary[]>("/itineraries/"),
  getById: (id: number) => apiClient.get<ItineraryDetails>(`/itineraries/${id}`),
  create: (data: ItineraryCreate) => apiClient.post<Itinerary>("/itineraries/", data),
  rename: (id: number, data: ItineraryCreate) =>
    apiClient.put<Itinerary>(`/itineraries/${id}`, data),
  delete: (id: number) => apiClient.delete(`/itineraries/${id}`),
  addDestination: (data: AddDestinationRequest) =>
    apiClient.post<ItineraryDetails>("/itineraries/add-destination", data),
};

export default itinerariesService;
