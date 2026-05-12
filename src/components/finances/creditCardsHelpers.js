// Helpers puros para el módulo de tarjetas de crédito.
// No dependen de hooks, theme ni state de React.

// True si el mes/año dado está más allá del límite de N meses futuros desde hoy.
export function isBeyondFutureLimit(year, month, limitMonths = 1) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  let limitMonth = currentMonth + limitMonths;
  let limitYear = currentYear;

  if (limitMonth > 12) {
    limitYear += Math.floor(limitMonth / 12);
    limitMonth = limitMonth % 12;
    if (limitMonth === 0) {
      limitMonth = 12;
      limitYear--;
    }
  }

  if (year > limitYear) return true;
  if (year < limitYear) return false;
  return month > limitMonth;
}

// True si el año/mes seleccionado está en el futuro respecto al mes actual.
export function isFutureMonth(year, month) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
}

// True si una fecha está más allá del límite permitido (1 mes futuro por defecto).
// Las fechas pasadas (<=hoy) nunca son "más allá del límite".
export function isDateBeyondLimit(date, limitMonths = 1) {
  const checkDate = date instanceof Date ? date : new Date(date);
  const today = new Date();
  if (checkDate <= today) return false;

  const checkMonth = checkDate.getMonth() + 1;
  const checkYear = checkDate.getFullYear();

  return isBeyondFutureLimit(checkYear, checkMonth, limitMonths);
}

// Devuelve los próximos N viernes empezando desde el viernes siguiente a hoy.
export function calculateNextFridays(count) {
  const fridays = [];
  const today = new Date();
  let nextFriday = new Date(today);

  while (nextFriday.getDay() !== 5) {
    nextFriday.setDate(nextFriday.getDate() + 1);
  }

  fridays.push(new Date(nextFriday));

  for (let i = 1; i < count; i++) {
    const newFriday = new Date(fridays[i - 1]);
    newFriday.setDate(newFriday.getDate() + 7);
    fridays.push(newFriday);
  }

  return fridays;
}

// Devuelve el mes anterior al dado (1-12) y su año.
export function getPreviousMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

// True si el mes/año seleccionado coincide con el mes calendario inmediatamente anterior al actual.
export function isPreviousCalendarMonth(year, month) {
  const today = new Date();
  const { year: prevYear, month: prevMonth } = getPreviousMonth(
    today.getFullYear(),
    today.getMonth() + 1
  );
  return year === prevYear && month === prevMonth;
}

// Parsea una fecha en formatos flexibles: DD/MM/YYYY, YYYY-MM-DD, ISO o Date.
// Evita problemas de zona horaria construyendo Date con (year, month-1, day).
// Devuelve null si la entrada no es interpretable como fecha válida.
export function parseFlexibleDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : new Date(value);
  if (typeof value !== 'string') return null;
  if (value.includes('/')) {
    const [day, month, year] = value.split('/').map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day);
  }
  if (value.includes('-')) {
    const [year, month, day] = value.split('-').map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day);
  }
  const fallback = new Date(value);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Devuelve { prevClosingDate, currentClosingDate } como Date para una tarjeta y mes.
// Usa la fecha específica configurada o cae al `defaultClosingDay`.
// Como último recurso usa el último día del mes correspondiente.
export function getCardClosingDates(card, year, month) {
  const { year: prevYear, month: prevMonth } = getPreviousMonth(year, month);
  const prevKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  const currentKey = `${year}-${String(month).padStart(2, '0')}`;

  const prevConfigured = card?.dates?.[prevKey]?.closingDate;
  const prevClosingDate =
    parseFlexibleDate(prevConfigured) ||
    (card?.defaultClosingDay
      ? new Date(prevYear, prevMonth - 1, card.defaultClosingDay)
      : new Date(prevYear, prevMonth, 0));

  const currentConfigured = card?.dates?.[currentKey]?.closingDate;
  const currentClosingDate =
    parseFlexibleDate(currentConfigured) ||
    (card?.defaultClosingDay
      ? new Date(year, month - 1, card.defaultClosingDay)
      : new Date(year, month, 0));

  return { prevClosingDate, currentClosingDate };
}

// Filtra y ordena las transacciones de una tarjeta por período de facturación.
// El período es (prevClosingDate, currentClosingDate] — exclusivo en el cierre anterior,
// inclusivo en el cierre actual. Devuelve array ordenado más reciente primero.
export function filterAndSortBillingPeriodTransactions(
  transactionsObj,
  prevClosingDate,
  currentClosingDate
) {
  const truncate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const prevTime = truncate(prevClosingDate);
  const currentTime = truncate(currentClosingDate);

  const filtered = [];
  Object.keys(transactionsObj || {}).forEach((key) => {
    const t = transactionsObj[key];
    const txDate = parseFlexibleDate(t.date);
    if (!txDate) return;
    const txTime = truncate(txDate);
    if (txTime > prevTime && txTime <= currentTime) {
      filtered.push({ id: key, ...t });
    }
  });

  filtered.sort((a, b) => {
    const dateA = parseFlexibleDate(a.date);
    const dateB = parseFlexibleDate(b.date);
    return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
  });
  return filtered;
}

// Calcula la fecha de cierre por defecto para `monthData` cuando no está configurada.
// Devuelve string YYYY-MM-DD o '' si la tarjeta no tiene día default.
export function defaultClosingDateString(card, year, month) {
  if (!card?.defaultClosingDay) return '';
  const day = String(card.defaultClosingDay).padStart(2, '0');
  return `${year}-${String(month).padStart(2, '0')}-${day}`;
}

// Calcula la fecha de vencimiento por defecto: cae en el mes siguiente al seleccionado.
// Devuelve string YYYY-MM-DD o '' si la tarjeta no tiene día default.
export function defaultDueDateString(card, year, month) {
  if (!card?.defaultDueDay) return '';
  const dueMonth = month === 12 ? 1 : month + 1;
  const dueYear = month === 12 ? year + 1 : year;
  const day = String(card.defaultDueDay).padStart(2, '0');
  return `${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`;
}

// Formato de fecha amigable usado para registros en RTDB: D/M/YYYY (sin padding).
function formatDayMonthYear(date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Construye el objeto `updates` para `bulkUpdate` que persiste el pago de tarjetas.
// Registra: pago global del mes, payments por tarjeta (solo las con saldo), una
// expense por cuota (viernes), y actualiza savings/amountARS + history.
//
// Las keys de RTDB (`expenseKeys`, `savingsHistoryKey`) se pre-generan en el
// orquestador con `generateKey` y se pasan acá, manteniendo el helper puro.
export function buildPaymentUpdates({
  cards,
  cardTotals, // Map<cardId, amount>
  paymentMonthKey,
  selectedMonth,
  selectedYear,
  monthName, // para el campo `description`
  roundedAmount,
  numberOfPayments,
  paymentDates,
  paymentAmounts,
  dollarRateVenta,
  currentSavings,
  expenseKeys, // Array<string> con length = numberOfPayments
  savingsHistoryKey,
}) {
  const firstFormatted = formatDayMonthYear(paymentDates[0]);
  const nowIso = new Date().toISOString();
  const updates = {};

  updates[`creditCardPayments/${paymentMonthKey}`] = {
    amount: roundedAmount,
    date: firstFormatted,
    description: `Pago total de tarjetas - ${monthName} ${selectedYear}`,
    paymentDate: nowIso,
    numberOfPayments,
    paymentAmounts,
    cardDetails: cards.map((c) => ({ id: c.id, name: c.name, amount: cardTotals[c.id] || 0 })),
  };

  cards.forEach((card) => {
    const cardAmount = cardTotals[card.id] || 0;
    if (cardAmount > 0) {
      updates[`creditCards/${card.id}/payments/${paymentMonthKey}`] = {
        amount: cardAmount,
        date: firstFormatted,
        paymentDate: nowIso,
        numberOfPayments,
        paymentAmounts,
      };
    }
  });

  for (let i = 0; i < numberOfPayments; i++) {
    updates[`expenses/${expenseKeys[i]}`] = {
      amount: paymentAmounts[i],
      amountUSD: paymentAmounts[i] / dollarRateVenta,
      category: 'Tarjetas de credito',
      subcategory: '',
      date: formatDayMonthYear(paymentDates[i]),
      description: `Pago ${i + 1}/${numberOfPayments} tarjetas - ${monthName} ${selectedYear}`,
      valorUSD: dollarRateVenta,
      paymentMethod: 'cash',
      creditCardPayment: true,
      paymentMonth: paymentMonthKey,
    };
  }

  const newSavingsTotal = currentSavings - roundedAmount;
  updates['savings/amountARS'] = newSavingsTotal;
  updates[`savings/amountARSHistory/${savingsHistoryKey}`] = {
    date: firstFormatted,
    amount: -roundedAmount,
    newTotal: newSavingsTotal,
  };

  return updates;
}
