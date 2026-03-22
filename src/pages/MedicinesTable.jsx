import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function MedicinesTable({ language = "en" }) {
  const [medicines, setMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // -------------------------
  // i18n (EN / RW)
  // -------------------------
  const I18N = useMemo(
    () => ({
      en: {
        title: "Your Medicines",
        medicineNameCol: "Medicine Name",
        statusCol: "Status",
        actionsCol: "Actions",
        deleteAll: "Delete all",
        deleting: "Deleting...",
        available: "Available",
        outOfStock: "Out of Stock",
        addingNew: "Adding New Medicine",
        placeholder: "Enter the medicine name",
        addNew: "Add new Medicine",
        enterNameAlert: "Enter medicine name",
        serverError: "Server error",
        confirmDeleteAll:
          "Are you sure you want to delete ALL medicines? This cannot be undone.",
        deletedAllDone: "All medicines deleted successfully.",
        failedDeleteAll: "Failed to delete all medicines.",
        loading: "Loading...",
        empty: "No medicines yet.",
      },
      rw: {
        title: "Imiti Yawe",
        medicineNameCol: "Izina ry'umuti",
        statusCol: "Status",
        actionsCol: "Ibikorwa",
        deleteAll: "Siba byose",
        deleting: "Birimo gusibwa...",
        available: "Birahari",
        outOfStock: "Byarashize",
        addingNew: "Ongeraho Umuti Mushya",
        placeholder: "Andika izina ry'umuti",
        addNew: "Ongeraho umuti",
        enterNameAlert: "Andika izina ry'umuti",
        serverError: "Ikibazo kuri server",
        confirmDeleteAll: "Uremeza gusiba imiti yose? Ibi ntibisubirwaho.",
        deletedAllDone: "Imiti yose yasibwe neza.",
        failedDeleteAll: "Gusiba imiti yose byanze.",
        loading: "Birimo gupakururwa...",
        empty: "Nta miti iraboneka ubu.",
      },
    }),
    [],
  );

  const t = (key) => I18N[language]?.[key] ?? I18N.en[key] ?? key;

  // -------------------------
  // API Calls
  // -------------------------
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://imipharm.vercel.app/medicines", {
        withCredentials: true,
      });
      setMedicines(res.data || []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `https://imipharm.vercel.app/medicines/${id}`,
        { status },
        { withCredentials: true },
      );
      fetchMedicines();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || t("serverError"));
    }
  };

  const addMedicine = async () => {
    if (!medicineName.trim()) {
      alert(t("enterNameAlert"));
      return;
    }

    try {
      const res = await axios.post(
        "https://imipharm.vercel.app/medicines",
        { medicine_name: medicineName.trim() },
        { withCredentials: true },
      );

      // keep your logic safe: update list locally + clear input
      setMedicines((prev) => [...prev, res.data]);
      setMedicineName("");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || t("serverError"));
    }
  };

  const deleteAllMedicines = async () => {
    const ok = window.confirm(t("confirmDeleteAll"));
    if (!ok) return;

    try {
      setDeletingAll(true);
      await axios.delete("https://imipharm.vercel.app/medicines", {
        withCredentials: true,
      });

      // safest: clear state then refetch (or just clear)
      setMedicines([]);
      // optional: refetch to be sure DB is empty
      // await fetchMedicines();

      alert(t("deletedAllDone"));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.Error ||
          t("failedDeleteAll"),
      );
    } finally {
      setDeletingAll(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Medicine-table">
      <h2>{t("title")}</h2>

      {loading && <p>{t("loading")}</p>}
      {!loading && medicines.length === 0 && <p>{t("empty")}</p>}

      <table>
        <thead>
          <tr>
            <th>{t("medicineNameCol")}</th>
            <th>{t("statusCol")}</th>
            <th>
              {t("actionsCol")}{" "}
              <button
                type="button"
                className="delete-btn"
                onClick={deleteAllMedicines}
                disabled={deletingAll}
                title={t("deleteAll")}
              >
                {deletingAll ? t("deleting") : t("deleteAll")}
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {medicines.map((m) => (
            <tr key={m.id}>
              <td>{m.medicine_name}</td>
              <td className="status">{m.status}</td>
              <td>
                <button
                  type="button"
                  className="available-btn"
                  onClick={() => updateStatus(m.id, "available")}
                >
                  {t("available")}
                </button>

                <button
                  type="button"
                  className="ended-btn"
                  onClick={() => updateStatus(m.id, "finished")}
                >
                  {t("outOfStock")}
                </button>
              </td>
            </tr>
          ))}

          <tr className="newmedicine">
            <td>
              <b>{t("addingNew")}</b>
            </td>

            <td>
              <input
                type="text"
                placeholder={t("placeholder")}
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMedicine();
                  }
                }}
              />
            </td>

            <td>
              <button type="button" className="add-btn" onClick={addMedicine}>
                {t("addNew")}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default MedicinesTable;
