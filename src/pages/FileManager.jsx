// File: src/pages/FileManager.jsx
import { useRef, useState, useEffect } from "react";
import axios from "axios";

function FileManager({ openFile, language = "en" }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const TXT = {
    en: {
      title: "File Manager",
      dropIdle: "Drop Excel/CSV file here or click",
      uploading: "Uploading...",
      noFiles: "No uploaded files yet.",
      open: "Open",
      del: "Delete",
      confirmDel: "Are you sure you want to delete this file?",
      deleteFailed: "Delete failed",
      serverError: "Server error",
      uploadFailed: "Upload failed",
      refresh: "Refresh",
    },
    rw: {
      title: "Gucunga Amadosiye",
      dropIdle: "Shyira Excel/CSV hano cyangwa ukande",
      uploading: "Birimo koherezwa...",
      noFiles: "Nta dosiye zoherejwe ziraboneka.",
      open: "Fungura",
      del: "Siba",
      confirmDel: "Uremeza gusiba iyi dosiye?",
      deleteFailed: "Gusiba byanze",
      serverError: "Ikibazo kuri seriveri",
      uploadFailed: "Kohereza byanze",
      refresh: "Ongera uzane",
    },
  };

  const t = (k) => TXT[language]?.[k] ?? TXT.en[k] ?? k;

  const fetchFiles = async () => {
    try {
      const res = await axios.get("https://imipharm-backend.onrender.com/files", {
        withCredentials: true,
      });
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const deleteFile = async (id) => {
    if (!window.confirm(t("confirmDel"))) return;

    try {
      const res = await fetch(`https://imipharm-backend.onrender.com/files/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert(data.message || t("deleteFailed"));
      }
    } catch (err) {
      console.error(err);
      alert(t("serverError"));
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      await axios.post("https://imipharm-backend.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // ✅ refresh list so the uploaded file shows immediately
      await fetchFiles();

      // ✅ clear input so you can re-upload same file
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      alert(err.response?.data?.Error || t("uploadFailed"));
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="file-manager-page">
      <h2>{t("title")}</h2>

        <div
        className="drop-zone"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? t("uploading") : t("dropIdle")}
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".xlsx,.xls,.csv"
          hidden
          onChange={(e) => handleFileUpload(e.target.files?.[0])}
        />
        <div className="upload-button"><img src="/icons/upload.png" alt="" /></div>
      </div>

      <div style={{ marginTop: 10 }}>
        <a className="refresh-btn" href="/" type="button" onClick={fetchFiles}>
          {t("refresh")}
        </a>
      </div>

      <ul className="files-list">
        {files.length === 0 ? (
          <li style={{ opacity: 0.7 }}>{t("noFiles")}</li>
        ) : (
          files.map((file) => (
            <li key={file.id}>
              {file.originalName || file.fileName || "Unknown"}

              <button
                className="delete-btn"
                onClick={() => deleteFile(file.id)}
              >
                {t("del")}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default FileManager;
