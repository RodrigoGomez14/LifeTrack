import * as db from './database';

// === Gastos ===

export const addExpense = (data) => db.push('expenses', data);

export const updateExpense = (id, data) => db.update(`expenses/${id}`, data);

export const removeExpense = (id) => db.remove(`expenses/${id}`);

// === Ingresos ===

export const addIncome = (data) => db.push('incomes', data);

export const updateIncome = (id, data) => db.update(`incomes/${id}`, data);

export const removeIncome = (id) => db.remove(`incomes/${id}`);

// === Tarjetas de crédito ===

export const addCreditCard = (data) => db.push('creditCards', data);

export const updateCreditCard = (cardId, data) =>
  db.update(`creditCards/${cardId}`, data);

export const setCardDatesForMonth = (cardId, monthKey, dates) =>
  db.update(`creditCards/${cardId}/dates/${monthKey}`, dates);

export const setCardStatement = (cardId, yearMonth, data) =>
  db.write(`creditCards/${cardId}/statements/${yearMonth}`, data);

export const addCardTransaction = (cardId, data) =>
  db.push(`creditCards/transactions/${cardId}`, data);
