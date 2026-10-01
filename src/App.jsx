import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { addAttendance, deleteAttendance, getAllAttendance, updateAttendance } from "./database/db";
import AttendanceForm from "./components/AttendanceForm";
import MonthlyDashboard from "./components/MonthlyDashboard";
import { downloadAttendancePDF } from "./services/pdfService";
import { formatDate, getCurrentMonth, getDayName, getMonthWeekdayDates, getTodayDate } from "./utils/dateUtils";
import { calculateMonthlyCompensatedRecords } from "./utils/compensationUtils";
import { REQUIRED_MINUTES, formatClockTime, formatTime, timeToMinutes } from "./utils/timeUtils";

function App() {
  const [date, setDate] = useState(getTodayDate);
  const [status, setStatus] = useState("Working");
  const [entryTime, setEntryTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [records, setRecords] = useState([]);
  const [result, setResult] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const indexedRecords = await getAllAttendance();
        if (indexedRecords.length > 0) {
          setRecords(indexedRecords);
          return;
        }

        const oldData = localStorage.getItem("attendanceRecords");
        if (!oldData) return;

        const oldRecords = JSON.parse(oldData);
        for (const record of oldRecords) await addAttendance(record);
        setRecords(oldRecords);
        localStorage.removeItem("attendanceRecords");
      } catch (error) {
        console.error("Failed to load attendance:", error);
      }
    };

    loadAttendance();
  }, []);

  const monthlyRecords = useMemo(
    () =>
      records
        .filter((record) => selectedMonth && record.date.startsWith(selectedMonth))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [records, selectedMonth],
  );

  const compensatedRecords = useMemo(
    () => calculateMonthlyCompensatedRecords(monthlyRecords),
    [monthlyRecords],
  );

  const weekdayDates = useMemo(() => getMonthWeekdayDates(selectedMonth), [selectedMonth]);
  const currentMonth = getCurrentMonth();

  const remainingWeekdays = useMemo(() => {
    if (!selectedMonth) return [];
    if (date && date.startsWith(selectedMonth)) {
      return weekdayDates.filter((dayDate) => dayDate >= date);
    }
    if (selectedMonth > currentMonth) return weekdayDates;
    return [];
  }, [selectedMonth, date, currentMonth, weekdayDates]);

  const remainingWorkingDays = useMemo(
    () =>
      remainingWeekdays.filter(
        (dayDate) => !monthlyRecords.some((record) => record.date === dayDate),
      ),
    [remainingWeekdays, monthlyRecords],
  );

  const summary = useMemo(() => {
    const totals = compensatedRecords.reduce(
      (resultTotals, record) => {
        if (record.status === "Working") {
          resultTotals.completed += 1;
          resultTotals.workedMinutes += Number(record.actual || 0);
          resultTotals.netShortageMinutes += record.compensatedShortage || 0;
          resultTotals.netExtraMinutes += record.compensatedExtra || 0;
        }
        if (record.status === "Holiday") resultTotals.holiday += 1;
        if (record.status === "Leave") resultTotals.leave += 1;
        return resultTotals;
      },
      {
        completed: 0,
        holiday: 0,
        leave: 0,
        workedMinutes: 0,
        netShortageMinutes: 0,
        netExtraMinutes: 0,
      },
    );

    return {
      totalWeekdays: weekdayDates.length,
      ...totals,
      remaining: remainingWorkingDays.length,
      compensationPerDay:
        totals.netShortageMinutes > 0 && remainingWorkingDays.length > 0
          ? Math.ceil(totals.netShortageMinutes / remainingWorkingDays.length)
          : 0,
    };
  }, [compensatedRecords, remainingWorkingDays, weekdayDates]);

  const calculateWorkingDuration = (entry, out) => {
    const entryMinutes = timeToMinutes(entry);
    const outMinutes = timeToMinutes(out);
    if (entryMinutes === null || outMinutes === null) return null;

    let actualMinutes = outMinutes - entryMinutes;
    if (actualMinutes < 0) actualMinutes += 24 * 60;
    return actualMinutes;
  };

  const saveAttendance = async () => {
    setResult("");
    if (!date) {
      setResult("Please select a date.");
      return;
    }
    if (records.some((record) => record.date === date && record.id !== editingId)) {
      setResult("Attendance already exists for this date.");
      return;
    }

    let actual = 0;
    let shortage = 0;
    let extra = 0;

    if (status === "Working") {
      if (!entryTime) {
        setResult("Please enter Entry Time.");
        return;
      }

      if (outTime) {
        actual = calculateWorkingDuration(entryTime, outTime);
        if (actual === null) {
          setResult("Invalid time.");
          return;
        }
        if (actual < REQUIRED_MINUTES) shortage = REQUIRED_MINUTES - actual;
        if (actual > REQUIRED_MINUTES) extra = actual - REQUIRED_MINUTES;
      }
    }

    const newRecord = {
      id: editingId ?? Date.now(),
      date,
      status,
      entryTime: status === "Working" ? entryTime : "-",
      outTime: status === "Working" ? outTime : "-",
      actual,
      shortage,
      extra,
      syncStatus: "pending",
    };

    try {
      if (editingId === null) {
        await addAttendance(newRecord);
        setRecords((previousRecords) =>
          [...previousRecords, newRecord].sort((a, b) => a.date.localeCompare(b.date)),
        );
      } else {
        await updateAttendance(newRecord);
        setRecords((previousRecords) =>
          previousRecords
            .map((record) => (record.id === editingId ? newRecord : record))
            .sort((a, b) => a.date.localeCompare(b.date)),
        );
      }
      setEntryTime("");
      setOutTime("");
      setEditingId(null);
      setResult(
        editingId === null
          ? outTime
            ? "Attendance saved successfully."
            : "Entry time saved. Add Out Time later using Edit."
          : outTime
            ? "Attendance updated successfully."
            : "Entry time updated. Add Out Time later using Edit.",
      );
    } catch (error) {
      console.error("Failed to save attendance:", error);
      setResult("Failed to save attendance.");
    }
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setDate(record.date);
    setStatus(record.status);
    setEntryTime(record.entryTime === "-" ? "" : record.entryTime);
    setOutTime(record.outTime === "-" ? "" : record.outTime);
    setResult("Editing attendance record.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEntryTime("");
    setOutTime("");
    setResult("");
  };

  const deleteRecord = async (id) => {
    try {
      await deleteAttendance(id);
      setRecords((previousRecords) => previousRecords.filter((record) => record.id !== id));
      setResult("Record deleted successfully.");
    } catch (error) {
      console.error("Failed to delete record:", error);
      setResult("Failed to delete record.");
    }
  };

  const downloadMonthlyPDF = async () => {
    try {
      if (!selectedMonth) {
        setResult("Please select a month first.");
        return;
      }

      await downloadAttendancePDF({
        selectedMonth,
        weekdayDates,
        compensatedRecords,
        summary,
        formatDate,
        getDayName,
        formatClockTime,
        formatTime,
      });
      setResult("Monthly PDF downloaded successfully.");
    } catch (error) {
      console.error("Failed to generate monthly PDF:", error);
      setResult("Failed to generate monthly PDF.");
    }
  };

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>Attendance Management</h1>
      </header>

      <AttendanceForm
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
        entryTime={entryTime}
        setEntryTime={setEntryTime}
        outTime={outTime}
        setOutTime={setOutTime}
        onSubmit={saveAttendance}
        onCancel={cancelEdit}
        isEditing={editingId !== null}
        result={result}
      />

      <MonthlyDashboard
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onDownloadPDF={downloadMonthlyPDF}
        summary={summary}
        remainingWorkingDays={remainingWorkingDays}
        compensatedRecords={compensatedRecords}
        weekdayDates={weekdayDates}
        onEdit={editRecord}
        onDelete={deleteRecord}
        formatDate={formatDate}
        getDayName={getDayName}
        formatClockTime={formatClockTime}
        formatTime={formatTime}
      />
    </div>
  );
}

export default App;
