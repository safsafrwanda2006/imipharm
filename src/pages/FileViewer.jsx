// File: src/pages/FileViewer.jsx
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

function FileViewer({ file, goBack, language = "en" }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const TXT = {
    en: {
      back: "← Back",
      noFile: "No file selected",
      unknown: "Unknown File",
      loading: "Loading file...",
      parseFail: "Failed to parse Excel/CSV file",
      fetchFail: "Failed to fetch file",
      invalid: "Invalid file object",
    },
    rw: {
      back: "← Subira inyuma",
      noFile: "Nta dosiye watoranyije",
      unknown: "Dosiye itazwi",
      loading: "Birimo gufungura dosiye...",
      parseFail: "Ntibishoboye gusoma Excel/CSV",
      fetchFail: "Ntibishoboye kuzana dosiye",
      invalid: "Dosiye siyo",
    },
  };

  const t = (k) => TXT[language]?.[k] ?? TXT.en[k] ?? k;

  useEffect(() => {
    if (!file) return;

    setRows([]);
    setError("");

    const parseExcel = (data) => {
      try {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setRows(json);
      } catch {
        setError(t("parseFail"));
      }
    };

    // ✅ file.url should exist from backend (saved in files table)
    if (file.url) {
      fetch(file.url)
        .then((res) => {
          if (!res.ok) throw new Error(t("fetchFail"));
          return res.arrayBuffer();
        })
        .then((data) => parseExcel(data))
        .catch((err) => setError(err.message || t("fetchFail")));
      return;
    }

    // fallback: if you passed a Blob directly
    if (file instanceof Blob) {
      file
        .arrayBuffer()
        .then((data) => parseExcel(data))
        .catch(() => setError(t("parseFail")));
      return;
    }

    setError(t("invalid"));
  }, [file, language]);

  if (!file) return <p>{t("noFile")}</p>;

  return (
    <div
      className="file-viewer-page"
      style={{ padding: "20px", backgroundColor: "#f5f5f5" }}
    >
      <button onClick={goBack} style={{ marginBottom: "20px" }}>
        {t("back")}
      </button>

      <h2>{file.originalName || file.name || t("unknown")}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && rows.length > 0 && (
        <table border="1" cellPadding="5" cellSpacing="0">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!error && rows.length === 0 && <p>{t("loading")}</p>}
    </div>
  );
}

export default FileViewer;
