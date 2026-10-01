export const REQUIRED_MINUTES = 8 * 60 + 30;

export const timeToMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) {
    return "-";
  }

  const totalMinutes = Math.max(0, Math.floor(Number(minutes)));
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
    totalMinutes % 60,
  ).padStart(2, "0")}`;
};

export const formatClockTime = (time) => {
  if (!time || time === "-") return "-";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const storedMinutes = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;

  const normalizedValue = value.trim();
  if (!normalizedValue) return 0;
  return normalizedValue.includes(":")
    ? timeToMinutes(normalizedValue) || 0
    : Number(normalizedValue) || 0;
};
