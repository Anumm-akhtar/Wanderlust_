import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import packagesService, {
  type Package,
  type PackageCreate,
  type PackageUpdate,
} from "../services/packages.service";

interface PackagesState {
  packages: Package[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  packageDestinations: Record<number, number[]>;
}

const initialState: PackagesState = {
  packages: [],
  loading: false,
  actionLoading: false,
  error: null,
  packageDestinations: {},
};

export const fetchPackages = createAsyncThunk(
  "packages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await packagesService.getAll();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch packages");
    }
  },
);

export const createPackage = createAsyncThunk(
  "packages/create",
  async (data: PackageCreate, { rejectWithValue }) => {
    try {
      const res = await packagesService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to create package");
    }
  },
);

export const updatePackage = createAsyncThunk(
  "packages/update",
  async ({ id, data }: { id: number; data: PackageUpdate }, { rejectWithValue }) => {
    try {
      const res = await packagesService.update(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to update package");
    }
  },
);

export const deletePackage = createAsyncThunk(
  "packages/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await packagesService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to delete package");
    }
  },
);

export const fetchPackageDestinations = createAsyncThunk(
  "packages/fetchDestinations",
  async (pkgId: number, { rejectWithValue }) => {
    try {
      const res = await packagesService.getDestinations(pkgId);
      return { pkgId, destIds: res.data.map((d) => d.dest_id) };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch package destinations");
    }
  },
);

export const addDestinationToPackage = createAsyncThunk(
  "packages/addDestination",
  async ({ pkgId, destId }: { pkgId: number; destId: number }, { rejectWithValue }) => {
    try {
      await packagesService.addDestination(pkgId, destId);
      return { pkgId, destId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to add destination");
    }
  },
);

export const removeDestinationFromPackage = createAsyncThunk(
  "packages/removeDestination",
  async ({ pkgId, destId }: { pkgId: number; destId: number }, { rejectWithValue }) => {
    try {
      await packagesService.removeDestination(pkgId, destId);
      return { pkgId, destId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to remove destination");
    }
  },
);

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
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
      .addCase(createPackage.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.packages.push(action.payload);
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePackage.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.packages.findIndex((p) => p.pkg_id === action.payload.pkg_id);
        if (idx !== -1) state.packages[idx] = action.payload;
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePackage.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.packages = state.packages.filter((p) => p.pkg_id !== action.payload);
        delete state.packageDestinations[action.payload];
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPackageDestinations.fulfilled, (state, action) => {
        const { pkgId, destIds } = action.payload;
        state.packageDestinations[pkgId] = destIds;
      })
      .addCase(addDestinationToPackage.fulfilled, (state, action) => {
        const { pkgId, destId } = action.payload;
        if (!state.packageDestinations[pkgId]) {
          state.packageDestinations[pkgId] = [];
        }
        if (!state.packageDestinations[pkgId].includes(destId)) {
          state.packageDestinations[pkgId].push(destId);
        }
      })
      .addCase(removeDestinationFromPackage.fulfilled, (state, action) => {
        const { pkgId, destId } = action.payload;
        if (state.packageDestinations[pkgId]) {
          state.packageDestinations[pkgId] = state.packageDestinations[pkgId].filter(
            (id) => id !== destId,
          );
        }
      });
  },
});

export const { clearError } = packagesSlice.actions;
export default packagesSlice.reducer;
