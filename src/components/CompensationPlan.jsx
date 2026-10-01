function CompensationPlan({ summary, remainingWorkingDays, formatTime }) {
  return (
    <div className="compensation-box">
      <h3>Compensation Plan</h3>

      {summary.netShortageMinutes > 0 ? (
        remainingWorkingDays.length > 0 ? (
          <p>
            Remaining Shortage: <strong>{formatTime(summary.netShortageMinutes)}</strong>
            <br />
            Remaining Working Days: <strong>{summary.remaining}</strong>
            <br />
            Daily Compensation: <strong>{formatTime(summary.compensationPerDay)}</strong>
          </p>
        ) : (
          <p>No remaining working days.</p>
        )
      ) : (
        <p>No shortage. 🎉</p>
      )}
    </div>
  );
}

export default CompensationPlan;
