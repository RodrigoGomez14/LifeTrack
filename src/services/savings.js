import * as db from './database';
import { getDate } from '../utils';

// Mapea moneda al nodo de balance y al de history correspondiente.
const CURRENCY_PATHS = {
  ARS: {
    balance: 'savings/amountARS',
    history: 'savings/amountARSHistory',
    amountField: 'amount',
  },
  USD: {
    balance: 'savings/amountUSD',
    history: 'savings/amountUSDHistory',
    amountField: 'amountUSD',
  },
};

// Patrón unificado: actualizar saldo + dejar registro en history en una sola operación atómica.
// Reemplaza la dupla "set amountX = old + delta; push amountXHistory(...)" duplicada en 6 archivos.
// `amount` es delta con signo (positivo = ingresa, negativo = egresa).
// `currentBalance` lo pasa el componente (lo tiene del store) para evitar una lectura extra.
// `extras` se mergea en la entrada de history (ej. source, description).
export const updateSavingsWithHistory = ({ currency, amount, currentBalance, ...extras }) => {
  const config = CURRENCY_PATHS[currency];
  if (!config) throw new Error(`Moneda desconocida: ${currency}`);

  const newTotal = (currentBalance || 0) + amount;
  const historyKey = db.generateKey(config.history);

  return db.bulkUpdate({
    [config.balance]: newTotal,
    [`${config.history}/${historyKey}`]: {
      date: getDate(),
      [config.amountField]: amount,
      newTotal,
      ...extras,
    },
  });
};

// === Fondos de ahorro ===

export const addSavingsFund = (data) => db.push('savingsFunds', data);

export const removeFund = (fundId) => db.remove(`savingsFunds/${fundId}`);

// Mover dinero entre savings y un fondo. `amount` positivo = depósito al fondo
// (sale de savings); negativo = retiro del fondo (vuelve a savings).
// Atomiza balance del fondo, lastContribution, history del fondo, balance ARS, history ARS.
export const transferToFund = ({
  fundId,
  amount,
  currentFundBalance,
  currentSavings,
  transactionData,
}) => {
  const newFundBalance = (currentFundBalance || 0) + amount;
  const newSavingsBalance = (currentSavings || 0) - amount;

  const fundHistoryKey = db.generateKey(`savingsFunds/${fundId}/history`);
  const savingsHistoryKey = db.generateKey('savings/amountARSHistory');

  return db.bulkUpdate({
    [`savingsFunds/${fundId}/balance`]: newFundBalance,
    [`savingsFunds/${fundId}/lastContribution`]: new Date().toISOString(),
    [`savingsFunds/${fundId}/history/${fundHistoryKey}`]: transactionData,
    'savings/amountARS': newSavingsBalance,
    [`savings/amountARSHistory/${savingsHistoryKey}`]: {
      date: getDate(),
      amount: -amount,
      newTotal: newSavingsBalance,
    },
  });
};

// === Mantenimiento del auto ===

export const setCarMaintenancePercentage = (value) =>
  db.write('savings/carMaintenancePercentage', value);

export const setCarMaintenancePending = (value) =>
  db.write('savings/carMaintenancePending', value);

// Mueve `carMaintenancePending` al total `carMaintenance` de forma atómica.
export const applyCarMaintenancePending = () =>
  db.transaction('savings', (data) => {
    if (data) {
      data.carMaintenance =
        (data.carMaintenance || 0) + parseInt(data.carMaintenancePending || 0);
    }
    return data;
  });
