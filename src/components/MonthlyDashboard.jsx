import AttendanceTable from "./AttendanceTable";
import CompensationPlan from "./CompensationPlan";
import SummaryCard from "./SummaryCard";

function MonthlyDashboard({
  selectedMonth,
  setSelectedMonth,
  onDownloadPDF,
  summary,
  remainingWorkingDays,
  compensatedRecords,
  weekdayDates,
  onEdit,
  onDelete,
  formatDate,
  getDayName,
  formatClockTime,
  formatTime,
}) {
  const cards = [
    ["Weekdays", summary.totalWeekdays],
    ["Completed", summary.completed],
    ["Remaining", summary.remaining],
    ["Holiday", summary.holiday],
    ["Leave", summary.leave],
    ["Worked", formatTime(summary.workedMinutes)],
    ["Net Shortage", formatTime(summary.netShortageMinutes)],
    ["Extra", formatTime(summary.netExtraMinutes)],
  ];

  return (
    <section className="panel">
      <h2>Monthly Dashboard</h2>

      <div className="month-toolbar">
        <div className="form-group">
          <label htmlFor="month-picker">Select Month</label>
          <input
            id="month-picker"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </div>
        <button type="button" className="primary-button" onClick={onDownloadPDF}>
          Download Monthly PDF
        </button>
      </div>

      <div className="summary-grid">
        {cards.map(([title, value]) => (
          <SummaryCard key={title} title={title} value={value} />
        ))}
      </div>

      <CompensationPlan
        summary={summary}
        remainingWorkingDays={remainingWorkingDays}
        formatTime={formatTime}
      />

      <AttendanceTable
        records={compensatedRecords}
        weekdayDates={weekdayDates}
        onEdit={onEdit}
        onDelete={onDelete}
        formatDate={formatDate}
        getDayName={getDayName}
        formatClockTime={formatClockTime}
        formatTime={formatTime}
      />
    </section>
  );
}

export default MonthlyDashboard;
