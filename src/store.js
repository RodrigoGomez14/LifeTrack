import create from 'zustand';

const useStore = create((set) => ({
  userLoggedIn: false,
  setUserLoggedIn: (value) => set({ userLoggedIn: value }),
  isLoading: true,
  setIsLoading: (value) => set({ isLoading: value }),
  userData: null,
  setUserData: (data) => set({ userData: data }),
  dollarRate: null,
  setDollarRate: (rate) => set({ dollarRate: rate }),
}));

export { useStore };
