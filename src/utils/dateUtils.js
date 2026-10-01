export const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
};

export const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthWeekdayDates = (monthString) => {
  if (!monthString) return [];
  const [year, month] = monthString.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() >= 1 && date.getDay() <= 5) {
      dates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    }
  }

  return dates;
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export const getDayName = (dateString) => {
  if (!dateString) return "-";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
};
