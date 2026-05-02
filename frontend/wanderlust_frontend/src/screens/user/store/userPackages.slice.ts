import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userPackagesService, { type Package } from "../services/packages.service";
import type { Destination } from "../services/destinations.service";

interface UserPackagesState {
  packages: Package[];
  selected: Package | null;
  selectedDestinations: Destination[];
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: UserPackagesState = {
  packages: [],
  selected: null,
  selectedDestinations: [],
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchPackages = createAsyncThunk(
  "userPackages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userPackagesService.getAll();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch packages");
    }
  },
);

export const fetchPackageById = createAsyncThunk(
  "userPackages/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const [pkgRes, destRes] = await Promise.all([
        userPackagesService.getById(id),
        userPackagesService.getDestinations(id),
      ]);
      return { pkg: pkgRes.data, destinations: destRes.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Package not found");
    }
  },
);

const userPackagesSlice = createSlice({
  name: "userPackages",
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
      state.selectedDestinations = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPackageById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload.pkg;
        state.selectedDestinations = action.payload.destinations;
      })
      .addCase(fetchPackageById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = userPackagesSlice.actions;
export default userPackagesSlice.reducer;
