import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * Usage (NO ROUTES):
 * - Open link: http://localhost:5173/?reset=1&token=RAW_TOKEN
 * - In App.jsx: if (resetMode) render <ResetPassword onDone={...}/>
 */
export default function ResetPassword({ onDone }) {
  const token = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return (p.get("token") || "").trim();
  }, []);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsg("Invalid reset link (missing token).");
      setOk(false);
    }
  }, [token]);

  const submit = async () => {
    setMsg("");
    setOk(false);

    if (!token) return setMsg("Invalid reset link.");
    if (!password || password.length < 8) return setMsg("Password must be at least 8 characters.");
    if (password !== confirm) return setMsg("Passwords do not match.");

    try {
      setLoading(true);

      const r = await axios.post(
        "http://localhost:8081/reset-password",
        { token, password },
        { withCredentials: true }
      );

      setOk(true);
      setMsg(r.data?.message || "Password updated successfully.");

      // optional: remove token from URL for safety
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      url.searchParams.delete("reset");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {
      setOk(false);
      setMsg(e?.response?.data?.error || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authX">
      <div className="authCard">
        <div className="authHead">
          <h2>Set new password</h2>
          <p>Choose a strong password (min 8 characters).</p>
        </div>

        {msg && (
          <div className={`authHint ${ok ? "ok" : "err"}`}>
            {msg}
          </div>
        )}

        <div className="authField">
          <label>New Password</label>
          <div className="authPassRow">
            <input
              className="authInput"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="authEye"
              onClick={() => setShow((p) => !p)}
              aria-label="Toggle password visibility"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <small className="authSmall">Tip: use letters + numbers for better security.</small>
        </div>

        <div className="authField">
          <label>Confirm Password</label>
          <input
            className="authInput"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="********"
            autoComplete="new-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
        </div>

        <div className="authActions">
          <button
            type="button"
            className="authBtn ghost"
            onClick={() => {
              // if you want "back to login" behavior without routes
              if (onDone) onDone();
              else window.location.href = "http://localhost:5173/";
            }}
          >
            Back
          </button>

          <button
            type="button"
            className="authBtn"
            disabled={loading || !token}
            onClick={submit}
          >
            {loading ? "Saving..." : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}