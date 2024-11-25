// 导入所需的库
import * as XLSX from "xlsx";

/**
 * 将JavaScript对象数组导出为Excel文件
 * @param {Array} data - JavaScript对象数组，每个对象表示Excel中的一行
 * @param {string} filename - 导出的Excel文件名
 */
export async function exportToExcel(data, filename = "exported-data.xlsx") {
  // 将数据转换为工作表
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 创建一个新的工作簿并添加工作表
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 将工作簿转换为二进制字符串
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // 将二进制字符串转换为ArrayBuffer
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

  return blob;

  // 使用FileSaver保存文件
  // saveAs(blob, filename);
}

// 辅助函数：将字符串转换为ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}
