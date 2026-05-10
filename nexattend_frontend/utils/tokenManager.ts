export const tokenManager = {
  getToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,

  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },
};
