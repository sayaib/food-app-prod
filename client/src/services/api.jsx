
const API = 'http://localhost:5000/api/auth';

export async function requestOTP(data) {
  const res = await fetch(`${API}/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function verifyOTP(data) {
  const res = await fetch(`${API}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
