import create from 'zustand';
import { database, auth } from './firebase';

const useStore = create((set, get) => ({
  userLoggedIn: false,
  setUserLoggedIn: (value) => set({ userLoggedIn: value }),
  isLoading: true,
  setIsLoading: (value) => set({ isLoading: value }),
  userData: null,
  setUserData: (data) => set({ userData: data }),
  dollarRate: null,
  setDollarRate: (rate) => set({ dollarRate: rate }),
  
  // Función para actualizar savings
  updateSavings: async (savingsData) => {
    try {
      const updates = {};
      
      // Actualizar savings
      if (savingsData.amountARS !== undefined) {
        updates[`${auth.currentUser.uid}/savings/amountARS`] = savingsData.amountARS;
      }
      
      if (savingsData.amountUSD !== undefined) {
        updates[`${auth.currentUser.uid}/savings/amountUSD`] = savingsData.amountUSD;
      }
      
      if (savingsData.amountARSHistory) {
        updates[`${auth.currentUser.uid}/savings/amountARSHistory`] = savingsData.amountARSHistory;
      }
      
      if (savingsData.amountUSDHistory) {
        updates[`${auth.currentUser.uid}/savings/amountUSDHistory`] = savingsData.amountUSDHistory;
      }
      
      // Actualizar fondos de ahorro
      if (savingsData.funds) {
        updates[`${auth.currentUser.uid}/savingsFunds`] = savingsData.funds;
      }
      
      await database.ref().update(updates);
      
      // Actualizar el estado local
      const currentUserData = get().userData;
      set({
        userData: {
          ...currentUserData,
          savings: {
            ...currentUserData.savings,
            ...savingsData
          },
          savingsFunds: savingsData.funds || currentUserData.savingsFunds
        }
      });
      
    } catch (error) {
      console.error('Error updating savings:', error);
      throw error;
    }
  }
}));

export { useStore };
