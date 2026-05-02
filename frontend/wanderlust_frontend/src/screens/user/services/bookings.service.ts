import apiClient from "../../../services/apiClient";

export interface Booking {
  booking_id: number;
  bk_type: string;
  trip_id: number;
  travel_start_date?: string;
  travel_end_date?: string;
  numtravelers?: number;
  bk_cost?: number;
  status?: string;
  user_id: number;
  bk_date?: string;
}

export interface BookingCreate {
  bk_type: string;
  trip_id: number;
  travel_start_date?: string;
  travel_end_date?: string;
  numtravelers?: number;
  bk_cost?: number;
}

export interface Payment {
  payment_id: number;
  booking_id: number;
  payMethod: string;
  amount: number;
  payment_date?: string;
}

export interface PaymentCreate {
  payMethod: string;
  amount: number;
}

export interface DestinationInfo {
  dest_id: number;
  destName?: string;
  image?: string;
  price?: number;
  description?: string;
}

export interface PackageInfo {
  pkg_id: number;
  name?: string;
  image?: string;
  price?: number;
  description?: string;
}

export interface ItineraryInfo {
  itinerary_id: number;
  itinerary_name?: string;
  price?: number;
}

export interface BookingDetails {
  booking: Booking;
  payments: Payment[];
  package_info?: PackageInfo | null;
  destination_info?: DestinationInfo | null;
  itinerary_info?: ItineraryInfo | null;
}

export interface BookingSummary {
  booking: Booking;
  payment?: Payment | null;
  package_info?: PackageInfo | null;
  destination_info?: DestinationInfo | null;
  itinerary_info?: ItineraryInfo | null;
}

const bookingsService = {
  list: () => apiClient.get<Booking[]>("/bookings/"),
  getById: (id: number) => apiClient.get<BookingDetails>(`/bookings/${id}`),
  create: (data: BookingCreate) => apiClient.post<Booking>("/bookings/", data),
  confirmPayment: (bookingId: number, data: PaymentCreate) =>
    apiClient.post<BookingSummary>(`/bookings/${bookingId}/payment`, data),
  getSummary: (bookingId: number) =>
    apiClient.get<BookingSummary>(`/bookings/${bookingId}/summary`),
  cancel: (bookingId: number) =>
    apiClient.post(`/bookings/${bookingId}/cancel`),
};

export default bookingsService;
