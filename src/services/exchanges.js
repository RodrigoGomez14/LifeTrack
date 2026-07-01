import * as db from './database';

// === Exchanges (compra/venta de divisas) ===

export const addExchange = (data) => db.push('exchanges', data);

export const updateExchange = (id, data) => db.update(`exchanges/${id}`, data);

export const removeExchange = (id) => db.remove(`exchanges/${id}`);
