import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import destinationsService, {
  type Destination,
  type DestinationCreate,
  type DestinationUpdate,
} from "../services/destinations.service";

interface DestinationsState {
  destinations: Destination[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: DestinationsState = {
  destinations: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchDestinations = createAsyncThunk(
  "destinations/fetchAll",
  async (q: string | undefined, { rejectWithValue }) => {
    try {
      const res = await destinationsService.getAll(q);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch destinations");
    }
  },
);

export const createDestination = createAsyncThunk(
  "destinations/create",
  async (data: DestinationCreate, { rejectWithValue }) => {
    try {
      const res = await destinationsService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to create destination");
    }
  },
);

export const updateDestination = createAsyncThunk(
  "destinations/update",
  async ({ id, data }: { id: number; data: DestinationUpdate }, { rejectWithValue }) => {
    try {
      const res = await destinationsService.update(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to update destination");
    }
  },
);

export const deleteDestination = createAsyncThunk(
  "destinations/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await destinationsService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to delete destination");
    }
  },
);

const destinationsSlice = createSlice({
  name: "destinations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.loading = false;
        state.destinations = action.payload;
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createDestination.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createDestination.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.destinations.push(action.payload);
      })
      .addCase(createDestination.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDestination.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateDestination.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.destinations.findIndex(
          (d) => d.dest_id === action.payload.dest_id,
        );
        if (idx !== -1) state.destinations[idx] = action.payload;
      })
      .addCase(updateDestination.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDestination.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteDestination.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.destinations = state.destinations.filter(
          (d) => d.dest_id !== action.payload,
        );
      })
      .addCase(deleteDestination.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = destinationsSlice.actions;
export default destinationsSlice.reducer;
