// src/utils/api.js

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function saveProgress(userId, scene) {
  if (!userId || !scene) throw new Error("Missing userId or scene");
  const res = await fetch(`${BASE_URL}/progress/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, scene }),
  });
  if (!res.ok) throw new Error('Failed to save progress');
  return true;
}

export async function loadProgress(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${BASE_URL}/progress/load/${userId}`);
  if (!res.ok) throw new Error('Failed to load progress');
  const data = await res.json();
  return data.lastScene || 'Chapter1';
}
