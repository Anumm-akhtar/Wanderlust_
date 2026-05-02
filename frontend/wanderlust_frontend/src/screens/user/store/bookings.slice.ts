import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookingsService, {
  type Booking,
  type BookingCreate,
  type BookingDetails,
  type BookingSummary,
  type PaymentCreate,
} from "../services/bookings.service";

interface BookingsState {
  bookings: Booking[];
  selected: BookingDetails | null;
  summary: BookingSummary | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  selected: null,
  summary: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  "bookings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingsService.list();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch bookings");
    }
  },
);

export const fetchBookingById = createAsyncThunk(
  "bookings/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await bookingsService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Booking not found");
    }
  },
);

export const createBooking = createAsyncThunk(
  "bookings/create",
  async (data: BookingCreate, { rejectWithValue }) => {
    try {
      const res = await bookingsService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to create booking");
    }
  },
);

export const confirmPayment = createAsyncThunk(
  "bookings/confirmPayment",
  async (
    { bookingId, data }: { bookingId: number; data: PaymentCreate },
    { rejectWithValue },
  ) => {
    try {
      const res = await bookingsService.confirmPayment(bookingId, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Payment failed");
    }
  },
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancel",
  async (bookingId: number, { rejectWithValue }) => {
    try {
      await bookingsService.cancel(bookingId);
      return bookingId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to cancel booking");
    }
  },
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
      state.summary = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(confirmPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.summary = action.payload;
        const updated = action.payload.booking;
        const idx = state.bookings.findIndex((b) => b.booking_id === updated.booking_id);
        if (idx !== -1) state.bookings[idx] = updated;
        if (state.selected) state.selected.booking = updated;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.bookings.findIndex((b) => b.booking_id === action.payload);
        if (idx !== -1) state.bookings[idx].status = "Cancelled";
        if (state.selected) state.selected.booking.status = "Cancelled";
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
