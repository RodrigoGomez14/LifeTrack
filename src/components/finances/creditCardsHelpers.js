// Helpers puros para el módulo de tarjetas de crédito.
// No dependen de hooks, theme ni state de React.

// Identifica el tipo visual de tarjeta a partir del nombre.
export function getCardType(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('visa')) return 'visa';
  if (lower.includes('master')) return 'mastercard';
  return 'credit-card';
}

export function getCardGradient(cardType) {
  if (cardType === 'visa') return 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)';
  if (cardType === 'mastercard') return 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)';
  return 'linear-gradient(135deg, #455a64 0%, #78909c 100%)';
}

export function getCardLabel(cardType) {
  if (cardType === 'visa') return 'VISA';
  if (cardType === 'mastercard') return 'MASTER';
  return 'CARD';
}

// Quita el sufijo "- Cuota XX/YY" de una descripción para obtener la descripción base
// de una compra a cuotas. Las cuotas comparten esta base.
export function stripInstallmentSuffix(description = '') {
  return description.replace(/\s*-\s*Cuota\s+\d+\/\d+\s*$/i, '').trim();
}

// Extrae las compras a cuotas activas (con cuotas pendientes) de una tarjeta.
// Una compra a cuotas se identifica por description base + installments + monto por cuota.
// Devuelve [{description, category, installments, installmentAmount, paid, remaining, totalRemaining, futureDates}].
export function extractActiveInstallments(cardTransactions, today = new Date()) {
  if (!cardTransactions) return [];
  const groups = new Map();

  Object.values(cardTransactions).forEach((tx) => {
    if (!tx.installments || tx.installments < 2) return;
    const baseDesc = stripInstallmentSuffix(tx.description || '');
    const amountKey = Math.round((tx.amount || 0) * 100);
    const key = `${baseDesc}|${tx.installments}|${amountKey}`;
    if (!groups.has(key)) {
      groups.set(key, {
        description: baseDesc || '(sin descripción)',
        category: tx.category,
        subcategory: tx.subcategory,
        installments: tx.installments,
        installmentAmount: tx.amount || 0,
        items: [],
      });
    }
    groups.get(key).items.push({ ...tx, _date: parseFlexibleDate(tx.date) });
  });

  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return Array.from(groups.values())
    .map((g) => {
      const paid = g.items.filter((it) => {
        if (!it._date) return false;
        const t = new Date(it._date.getFullYear(), it._date.getMonth(), it._date.getDate()).getTime();
        return t <= todayTime;
      }).length;
      const remaining = Math.max(0, g.installments - paid);
      return {
        description: g.description,
        category: g.category,
        subcategory: g.subcategory,
        installments: g.installments,
        installmentAmount: g.installmentAmount,
        paid,
        remaining,
        totalRemaining: g.installmentAmount * remaining,
        futureDates: g.items
          .filter((it) => it._date && new Date(it._date.getFullYear(), it._date.getMonth(), it._date.getDate()).getTime() > todayTime)
          .map((it) => it._date),
      };
    })
    .filter((g) => g.remaining > 0)
    .sort((a, b) => b.totalRemaining - a.totalRemaining);
}

// Agrupa cuotas futuras de una tarjeta por mes (YYYY-MM) y devuelve [{key, label, total}]
// ordenado cronológicamente. Acepta el array devuelto por extractActiveInstallments.
export function buildFutureCommitmentByMonth(activeInstallments) {
  const monthMap = new Map(); // key YYYY-MM → total
  activeInstallments.forEach((g) => {
    g.futureDates.forEach((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + g.installmentAmount);
    });
  });

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => {
      const [y, m] = key.split('-').map(Number);
      return { key, label: `${months[m - 1]} ${String(y).slice(2)}`, total };
    });
}

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

  const trimmed = value.trim();

  // D/M/YYYY
  if (trimmed.includes('/')) {
    const [day, month, year] = trimmed.split('/').map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day);
  }

  // YYYY-MM-DD o ISO con hora/zona (ej. "2025-09-25T03:00:00.000Z").
  // Se toma SOLO la parte de fecha para que un timestamp no corra el día.
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // D-M-YYYY (variante sin barras)
  if (/^\d{1,2}-\d{1,2}-\d{4}/.test(trimmed)) {
    const [day, month, year] = trimmed.split('-').map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(trimmed);
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

// Fecha de cierre (Date) del período que cierra en `month`, con el mismo criterio que el
// filtrado de transacciones: fecha configurada → `defaultClosingDay` → último día del mes.
// Es la fuente de verdad para decidir si el período ya cerró (ej. card fantasma de resumen).
export function getPeriodClosingDate(card, year, month) {
  return getCardClosingDates(card, year, month).currentClosingDate;
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

// Calcula la fecha de vencimiento por defecto. Cae en el mes siguiente al seleccionado
// cuando el día de vencimiento es <= al de cierre (caso habitual); si no, cae en el mismo
// mes. Mismo criterio que usa el listado/Home para el badge de vencimiento.
// Devuelve string YYYY-MM-DD o '' si la tarjeta no tiene día default.
export function defaultDueDateString(card, year, month) {
  if (!card?.defaultDueDay) return '';
  const dueDay = card.defaultDueDay;
  const closingDay = card.defaultClosingDay || 0;
  let dueMonth = month;
  let dueYear = year;
  if (!closingDay || dueDay <= closingDay) {
    dueMonth = month === 12 ? 1 : month + 1;
    if (month === 12) dueYear = year + 1;
  }
  const day = String(dueDay).padStart(2, '0');
  return `${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`;
}

// Formato de fecha amigable usado para registros en RTDB: D/M/YYYY (sin padding).
function formatDayMonthYear(date) {
  const d = date instanceof Date ? date : parseFlexibleDate(date);
  if (!d) return '';
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Construye el objeto `updates` para `bulkUpdate` que persiste el pago de tarjetas.
// Registra: pago global del mes, payments por tarjeta (solo las con saldo), una
// expense por cuota (viernes), y actualiza savings/amountARS o savings/amountUSD + history.
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
  source, // 'ars' | 'usd'
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

  const isUSD = source === 'usd';

  for (let i = 0; i < numberOfPayments; i++) {
    updates[`expenses/${expenseKeys[i]}`] = {
      amount: isUSD ? paymentAmounts[i] * dollarRateVenta : paymentAmounts[i],
      amountUSD: isUSD ? paymentAmounts[i] : paymentAmounts[i] / dollarRateVenta,
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

  const savingsPath = isUSD ? 'savings/amountUSD' : 'savings/amountARS';
  const historyPath = isUSD ? 'savings/amountUSDHistory' : 'savings/amountARSHistory';

  const newSavingsTotal = currentSavings - roundedAmount;
  updates[savingsPath] = newSavingsTotal;
  updates[`${historyPath}/${savingsHistoryKey}`] = {
    date: firstFormatted,
    amount: -roundedAmount,
    newTotal: newSavingsTotal,
  };

  return updates;
}
