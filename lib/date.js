// Время окончания пар в миллисекундах.
const pairsEndTime = [
  36000000 + 900000, // 10:15.
  43200000, // 12:00.
  50400000 + 1500000, // 14:25.
  57600000 + 600000, // 16:10.
  61200000 + 3300000, // 17:15.
];

// Возвращает номер недели года в формате ISO.
export function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Возвращает номер недели пары (1 или 2) для указанной даты.
export function getPairWeekNumber(date) {
  return getWeekNumber(date) % 2 ? 1 : 2;
}

// Возвращает номер дня недели для указанной даты.
export function getPairDayNumber(date) {
  return date.getDay();
}

// Возвращает имя дня недели.
export function getPairDayName(pairDayNumber) {
  switch (pairDayNumber) {
    case 0:
      return "Воскресенье";
    case 1:
      return "Понедельник";
    case 2:
      return "Вторник";
    case 3:
      return "Среда";
    case 4:
      return "Четверг";
    case 5:
      return "Пятница";
    case 6:
      return "Суббота";
    default:
      return `Invalid day number of pair (${pairDayNumber}).`;
  }
}

// Возвращает номер пары (1 - 5) для указанной даты.
export function getPairNumber(date) {
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diff = date - dayStart;
  return pairsEndTime.findIndex((end) => diff < end) + 1 || pairsEndTime.length;
}
