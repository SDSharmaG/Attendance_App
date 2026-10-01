function AttendanceForm({
  date,
  setDate,
  status,
  setStatus,
  entryTime,
  setEntryTime,
  outTime,
  setOutTime,
  onSubmit,
  onCancel,
  isEditing,
  result,
}) {
  return (
    <section className="panel">
      <h2>Daily Attendance</h2>

      <div className="form-group">
        <label htmlFor="attendance-date">Date</label>
        <input
          id="attendance-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="attendance-status">Status</label>
        <select
          id="attendance-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="Working">Working</option>
          <option value="Holiday">Holiday</option>
          <option value="Leave">Leave</option>
        </select>
      </div>

      {status === "Working" && (
        <>
          <div className="form-group">
            <label htmlFor="entry-time">Entry Time</label>
            <input
              id="entry-time"
              type="time"
              value={entryTime}
              onChange={(event) => setEntryTime(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="out-time">Out Time</label>
            <input
              id="out-time"
              type="time"
              value={outTime}
              onChange={(event) => setOutTime(event.target.value)}
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="button" className="primary-button" onClick={onSubmit}>
          {isEditing ? "Update Attendance" : "Save Attendance"}
        </button>
        {isEditing && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {result && <p className="result-message">{result}</p>}
    </section>
  );
}

export default AttendanceForm;
