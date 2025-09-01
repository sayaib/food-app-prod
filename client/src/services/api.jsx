const API = "/api/auth";

// export const MAPBOX_PA = import.meta.env.VITE_MAPBOX_PA;

console.log(import.meta.env); // check everything available
export const MAPBOX_PA = import.meta.env.VITE_MAPBOX_PA;
export const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;
console.log("MAPBOX:", MAPBOX_PA);
console.log("STRIPE:", STRIPE_SECRET_KEY);


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
