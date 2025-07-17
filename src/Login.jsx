import React from 'react';
import { EventBus } from './game/EventBus'; // adjust if needed
import { BASE_URL } from './game/utils/apiConfig.js';
let loginPrompted = false;

function Login({ onLogin }) {
  const handlePrompt = async () => {
    if (loginPrompted) return;
    loginPrompted = true;

    const name = window.prompt("Enter your name:");
    if (!name) {
      loginPrompted = false;
      return;
    }

    const email = window.prompt("Enter your email:");
    if (!email) {
      loginPrompted = false;
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
        EventBus.emit('login-success');
      } else {
        window.alert(data.message || 'Login failed');
      }
    } catch (error) {
      window.alert('Network error: ' + error.message);
    } finally {
      loginPrompted = false;
    }
  };

  React.useEffect(() => {
    handlePrompt();
    // eslint-disable-next-line
  }, []);

  return null;
}

export default Login;
