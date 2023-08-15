import { Injectable } from "@angular/core";
import * as Excel from "exceljs";
import * as fs from "file-saver";
@Injectable({
  providedIn: "root",
})
export class ExcelService {
  constructor() {}

  generateExcel(
    title: string,
    header: any[],
    data: any[],
    name: string,
    footer: string,
    column: any[],
    align?: any[]
  ): any {
    // Create workbook and worksheet
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(name);

    // Add Row and formatting
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { name: "Calibri", family: 4, size: 16, bold: true };
    // worksheet.addRow([]);
    // const subTitleRow = worksheet.addRow(['Date : ' + this.datePipe.transform(new Date(), 'medium')]);

    // Format center text align
    titleRow.alignment = { vertical: "middle", horizontal: "center" };

    // Merge Cells
    worksheet.mergeCells(`A${titleRow.number}:${footer}${titleRow.number}`);

    // Blank Row
    worksheet.addRow([]);

    // Add Header Row
    const headerRow = worksheet.addRow(header);
    headerRow.alignment = { vertical: "middle", horizontal: "left" };

    // Cell Style : Fill and Border
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2D5D9F" },
      };
      cell.font = {
        name: "Calibri",
        family: 4,
        size: 12,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    data.forEach((d) => {
      const row = worksheet.addRow(d);
      for (let i = 0; i < column.length; i++) {
        worksheet.getColumn(i + 1).width = column[i];
        const cell = row.getCell(i + 1);
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: align !== undefined ? align[i] : [] };
      }
    });

    workbook.xlsx.writeBuffer().then((data1: any) => {
      const blob = new Blob([data1], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fs.saveAs(blob, name + ".xlsx");
    });
  }
}
