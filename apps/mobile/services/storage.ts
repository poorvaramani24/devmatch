import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';

export const storage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),

  getUserId: () => SecureStore.getItemAsync(USER_ID_KEY),
  setUserId: (id: string) => SecureStore.setItemAsync(USER_ID_KEY, id),
  removeUserId: () => SecureStore.deleteItemAsync(USER_ID_KEY),

  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  },
};
