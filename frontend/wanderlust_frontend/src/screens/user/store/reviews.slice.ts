import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reviewsService, {
  type Review,
  type ReviewCreate,
  type ReviewUpdate,
} from "../services/reviews.service";

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchReviews = createAsyncThunk(
  "reviews/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await reviewsService.list();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch reviews");
    }
  },
);

export const createReview = createAsyncThunk(
  "reviews/create",
  async (data: ReviewCreate, { rejectWithValue }) => {
    try {
      const res = await reviewsService.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to submit review");
    }
  },
);

export const updateReview = createAsyncThunk(
  "reviews/update",
  async ({ id, data }: { id: number; data: ReviewUpdate }, { rejectWithValue }) => {
    try {
      const res = await reviewsService.update(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to update review");
    }
  },
);

export const deleteReview = createAsyncThunk(
  "reviews/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await reviewsService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to delete review");
    }
  },
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createReview.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateReview.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.reviews.findIndex((r) => r.review_id === action.payload.review_id);
        if (idx !== -1) state.reviews[idx] = action.payload;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteReview.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reviews = state.reviews.filter((r) => r.review_id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
