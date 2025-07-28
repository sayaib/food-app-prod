const API = "/api/auth";
export const MAPBOX_PA =
  "pk.eyJ1Ijoic2F5YWlib3NsIiwiYSI6ImNtZG12bTgwdDFrdzkya3NmamoycXRteXQifQ.DZE5B9Hx6dXtGVGPUMYnYA";

export async function requestOTP(data) {
  const res = await fetch(`${API}/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function verifyOTP(data) {
  const res = await fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
