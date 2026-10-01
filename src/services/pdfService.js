import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const downloadAttendancePDF = async ({
  selectedMonth,
  weekdayDates,
  compensatedRecords,
  summary,
  formatDate,
  getDayName,
  formatClockTime,
  formatTime,
}) => {
  const monthLabel = new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const fileName = `Attendance_${monthLabel.replace(" ", "_")}.pdf`;
  const document = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  document.setFontSize(18);
  document.setFont(undefined, "bold");
  document.text("ATTENDANCE MANAGEMENT REPORT", 14, 16);
  document.setFont(undefined, "normal");
  document.setFontSize(11);
  document.text(`Month: ${monthLabel}`, 14, 24);
  document.setFontSize(12);
  document.setFont(undefined, "bold");
  document.text("SUMMARY", 14, 35);
  document.setFont(undefined, "normal");
  document.setFontSize(10);

  const summaryLines = [
    `Weekdays: ${summary.totalWeekdays}`,
    `Completed Days: ${summary.completed}`,
    `Remaining Days: ${summary.remaining}`,
    `Holiday: ${summary.holiday}`,
    `Leave: ${summary.leave}`,
    `Worked: ${formatTime(summary.workedMinutes)}`,
    `Shortage: ${formatTime(summary.netShortageMinutes)}`,
    `Extra: ${formatTime(summary.netExtraMinutes)}`,
  ];

  summaryLines.forEach((line, index) => {
    document.text(line, 14 + (index % 4) * 68, 43 + Math.floor(index / 4) * 6);
  });

  document.setFontSize(12);
  document.setFont(undefined, "bold");
  document.text("COMPENSATION PLAN", 14, 59);
  document.setFont(undefined, "normal");
  document.setFontSize(10);
  document.text(`Remaining Shortage: ${formatTime(summary.netShortageMinutes)}`, 14, 66);
  document.text(`Remaining Working Days: ${summary.remaining}`, 90, 66);
  document.text(`Daily Compensation: ${formatTime(summary.compensationPerDay)}`, 190, 66);

  const tableRows = weekdayDates.map((dayDate) => {
    const record = compensatedRecords.find((item) => item.date === dayDate);
    return [
      formatDate(dayDate),
      getDayName(dayDate),
      record ? record.status : "-",
      record ? formatClockTime(record.entryTime) : "-",
      record ? formatClockTime(record.outTime) : "-",
      record ? formatTime(record.actual) : "-",
      record ? formatTime(record.originalShortage) : "-",
      record ? formatTime(record.originalExtra) : "-",
    ];
  });

  autoTable(document, {
    startY: 74,
    head: [["Date", "Day", "Status", "Entry", "Out", "Actual", "Recorded Shortage", "Recorded Extra"]],
    body: tableRows,
    theme: "grid",
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5, halign: "center", valign: "middle" },
    headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const pageCount = document.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setFontSize(8);
    document.setFont(undefined, "normal");
    document.text(
      `Report generated from Attendance Management App | Page ${page} of ${pageCount}`,
      14,
      document.internal.pageSize.getHeight() - 8,
    );
  }

  if (Capacitor.isNativePlatform()) {
    const pdfData = document.output("datauristring").split(",")[1];
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: pdfData,
      directory: Directory.Documents,
      recursive: true,
    });
    await Share.share({
      title: "Monthly Attendance Report",
      text: `Attendance report for ${monthLabel}`,
      url: savedFile.uri,
      dialogTitle: "Share monthly attendance PDF",
    });
  } else {
    document.save(fileName);
  }
};
