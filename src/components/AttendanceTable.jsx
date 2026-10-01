function AttendanceTable({ records, weekdayDates, onEdit, onDelete, formatDate, getDayName, formatClockTime, formatTime }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            <th>Entry</th>
            <th>Out</th>
            <th>Actual</th>
            <th>Recorded Shortage</th>
            <th>Recorded Extra</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {weekdayDates.map((dayDate) => {
            const record = records.find((item) => item.date === dayDate);

            return (
              <tr key={dayDate}>
                <td>{formatDate(dayDate)}</td>
                <td>{getDayName(dayDate)}</td>
                <td>{record ? record.status : "-"}</td>
                <td>{record ? formatClockTime(record.entryTime) : "-"}</td>
                <td>{record ? formatClockTime(record.outTime) : "-"}</td>
                <td>{record ? (record.status === "Working" && record.outTime === "-" ? "In progress" : formatTime(record.actual)) : "-"}</td>
                <td>
                  {record
                    ? record.status === "Working" && record.outTime === "-"
                      ? "-"
                      : formatTime(record.originalShortage)
                    : "-"}
                </td>
                <td>
                  {record
                    ? record.status === "Working" && record.outTime === "-"
                      ? "-"
                      : formatTime(record.originalExtra)
                    : "-"}
                </td>
                <td>
                  {record ? (
                    <div className="action-buttons">
                      <button type="button" className="edit-button" onClick={() => onEdit(record)}>
                        Edit
                      </button>
                      <button type="button" className="delete-button" onClick={() => onDelete(record.id)}>
                        Delete
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
