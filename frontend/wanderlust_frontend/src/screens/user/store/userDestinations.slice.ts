import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userDestinationsService, {
  type Destination,
} from "../services/destinations.service";

interface UserDestinationsState {
  destinations: Destination[];
  selected: Destination | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: UserDestinationsState = {
  destinations: [],
  selected: null,
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchDestinations = createAsyncThunk(
  "userDestinations/fetchAll",
  async (q: string | undefined, { rejectWithValue }) => {
    try {
      const res = await userDestinationsService.getAll(q);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch destinations");
    }
  },
);

export const fetchDestinationById = createAsyncThunk(
  "userDestinations/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await userDestinationsService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Destination not found");
    }
  },
);

const userDestinationsSlice = createSlice({
  name: "userDestinations",
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
    },
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
      .addCase(fetchDestinationById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchDestinationById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchDestinationById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = userDestinationsSlice.actions;
export default userDestinationsSlice.reducer;
