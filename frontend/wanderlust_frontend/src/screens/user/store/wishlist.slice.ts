import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService, { type WishlistItem } from "../services/wishlist.service";

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistService.list();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch wishlist");
    }
  },
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (destId: number, { rejectWithValue }) => {
    try {
      const res = await wishlistService.add(destId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to add to wishlist");
    }
  },
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (itemId: number, { rejectWithValue }) => {
    try {
      await wishlistService.remove(itemId);
      return itemId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to remove from wishlist");
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        const exists = state.items.some((i) => i.item_id === action.payload.item_id);
        if (!exists) state.items.push(action.payload);
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((i) => i.item_id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
