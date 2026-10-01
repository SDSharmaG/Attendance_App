import { REQUIRED_MINUTES, storedMinutes } from "./timeUtils";

export const getRecordShortage = (record) => {
  if (record.status !== "Working") return 0;

  const storedShortage = record.shortage ?? record.shortageMinutes;
  if (storedShortage !== undefined && storedShortage !== null) {
    return storedMinutes(storedShortage);
  }

  return Math.max(0, REQUIRED_MINUTES - Number(record.actual || 0));
};

export const getRecordExtra = (record) => {
  if (record.status !== "Working") return 0;

  const storedExtra = record.extra ?? record.extraMinutes;
  if (storedExtra !== undefined && storedExtra !== null) {
    return storedMinutes(storedExtra);
  }

  return Math.max(0, Number(record.actual || 0) - REQUIRED_MINUTES);
};

export const calculateMonthlyCompensatedRecords = (records) => {
  const calculatedRecords = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => {
      const originalShortage = getRecordShortage(record);
      const originalExtra = getRecordExtra(record);

      return {
        ...record,
        originalShortage,
        originalExtra,
        compensatedShortage: originalShortage,
        compensatedExtra: originalExtra,
      };
    });

  const totalShortage = calculatedRecords.reduce(
    (total, record) => total + record.originalShortage,
    0,
  );
  const totalExtra = calculatedRecords.reduce((total, record) => total + record.originalExtra, 0);
  let shortageOffsetRemaining = Math.min(totalShortage, totalExtra);
  let extraOffsetRemaining = shortageOffsetRemaining;

  calculatedRecords.forEach((record) => {
    const shortageOffset = Math.min(record.originalShortage, shortageOffsetRemaining);
    record.compensatedShortage -= shortageOffset;
    shortageOffsetRemaining -= shortageOffset;

    const extraOffset = Math.min(record.originalExtra, extraOffsetRemaining);
    record.compensatedExtra -= extraOffset;
    extraOffsetRemaining -= extraOffset;
  });

  return calculatedRecords;
};
