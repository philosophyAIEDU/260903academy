"use client";

/** 필드에 쉼표/줄바꿈/따옴표가 있으면 CSV 규격대로 큰따옴표로 감싸고 이스케이프합니다. */
function csvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const BOM = "﻿"; // 엑셀에서 UTF-8 CSV의 한글이 깨지지 않도록 앞에 붙이는 바이트오더마크

/** 2차원 배열을 CSV 파일로 만들어 다운로드합니다. */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows.map((row) => row.map(csvField).join(",")).join("\r\n");
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
