import apiClient from "../../../services/apiClient";

export interface WishlistItem {
  item_id: number;
  dest_id: number;
  user_id: number;
}

const wishlistService = {
  list: () => apiClient.get<WishlistItem[]>("/wishlists/"),
  add: (destId: number) =>
    apiClient.post<WishlistItem>("/wishlists/", { dest_id: destId }),
  remove: (itemId: number) => apiClient.delete(`/wishlists/${itemId}`),
};

export default wishlistService;
