import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import itinerariesService, {
  type Itinerary,
  type ItineraryDetails,
  type ItineraryCreate,
  type AddDestinationRequest,
} from "../services/itineraries.service";

interface ItinerariesState {
  itineraries: Itinerary[];
  selected: ItineraryDetails | null;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ItinerariesState = {
  itineraries: [],
  selected: null,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
};

export const fetchItineraries = createAsyncThunk(
  "itineraries/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await itinerariesService.list();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch itineraries");
    }
  },
);

export const fetchItineraryById = createAsyncThunk(
  "itineraries/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await itinerariesService.getById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Itinerary not found");
    }
  },
);

export const createItinerary = createAsyncThunk(
  "itineraries/create",
  async (data: ItineraryCreate, { rejectWithValue }) => {
    try {
      const res = await itinerariesService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to create itinerary");
    }
  },
);

export const renameItinerary = createAsyncThunk(
  "itineraries/rename",
  async ({ id, data }: { id: number; data: ItineraryCreate }, { rejectWithValue }) => {
    try {
      const res = await itinerariesService.rename(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to rename itinerary");
    }
  },
);

export const deleteItinerary = createAsyncThunk(
  "itineraries/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await itinerariesService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to delete itinerary");
    }
  },
);

export const addDestinationToItinerary = createAsyncThunk(
  "itineraries/addDestination",
  async (data: AddDestinationRequest, { rejectWithValue }) => {
    try {
      const res = await itinerariesService.addDestination(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to add destination");
    }
  },
);

const itinerariesSlice = createSlice({
  name: "itineraries",
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
      .addCase(fetchItineraries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItineraries.fulfilled, (state, action) => {
        state.loading = false;
        state.itineraries = action.payload;
      })
      .addCase(fetchItineraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchItineraryById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchItineraryById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchItineraryById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createItinerary.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createItinerary.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.itineraries.unshift(action.payload);
      })
      .addCase(createItinerary.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(renameItinerary.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(renameItinerary.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.itineraries.findIndex(
          (i) => i.itinerary_id === action.payload.itinerary_id,
        );
        if (idx !== -1) state.itineraries[idx] = action.payload;
        if (state.selected?.itinerary.itinerary_id === action.payload.itinerary_id) {
          state.selected.itinerary = action.payload;
        }
      })
      .addCase(renameItinerary.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteItinerary.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteItinerary.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.itineraries = state.itineraries.filter(
          (i) => i.itinerary_id !== action.payload,
        );
      })
      .addCase(deleteItinerary.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addDestinationToItinerary.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addDestinationToItinerary.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update the itinerary in the list (price may have changed)
        const updated = action.payload.itinerary;
        const idx = state.itineraries.findIndex(
          (i) => i.itinerary_id === updated.itinerary_id,
        );
        if (idx !== -1) state.itineraries[idx] = updated;
        else state.itineraries.unshift(updated);
        // Update selected if open
        if (state.selected?.itinerary.itinerary_id === updated.itinerary_id) {
          state.selected = action.payload;
        }
      })
      .addCase(addDestinationToItinerary.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = itinerariesSlice.actions;
export default itinerariesSlice.reducer;
