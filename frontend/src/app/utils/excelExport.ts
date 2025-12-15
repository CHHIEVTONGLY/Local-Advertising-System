import ExcelJS from "exceljs";
import { WalletHistoryType } from "../types/WalletType";

// Export frontend data to Excel
export async function exportExcelFromData(
  data: WalletHistoryType[],
  filename = "report.xlsx",
  title = "Report"
) {
  if (data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");

  // 1️⃣ TITLE
  sheet.mergeCells("A1", `E1`); // Merge first row across first 5 columns
  const titleCell = sheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { size: 18, bold: true }; // Bigger font + bold
  titleCell.alignment = { horizontal: "center" }; // Centered

  // 2️⃣ HEADER
  const headerRow = sheet.addRow(Object.keys(data[0]));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" }, // Light gray
    };
  });

  // 3️⃣ DATA ROWS
  data.forEach((item) => {
    const row = sheet.addRow(Object.values(item));
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // 4️⃣ AUTO COLUMN WIDTH
  (sheet.columns ?? []).forEach((col) => {
    if (!col) return;
    let maxLength = 0;
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });
    col.width = maxLength + 2;
  });

  // 5️⃣ DOWNLOAD
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
