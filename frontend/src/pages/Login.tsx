import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isOffline } from '../lib/api';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Sign in with your BETZO account to open your workspace.');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');

    setBusy(true);
    try {
      const ok = await signIn(email, password);
      if (ok) {
        setMessage('Signed in. Opening your workspace…');
        navigate(from && from !== '/welcome' ? from : '/overview', { replace: true });
      } else {
        setMessage('Incorrect email or password.');
      }
    } catch (error) {
      setMessage(
        isOffline(error)
          ? 'Could not reach the BETZO backend. Check your connection and try again.'
          : 'Sign-in failed. Please try again in a moment.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="public-shell public-auth public-login">
      <div className="public-content">
        <div className="auth-wrap">
          <div className="card">
            <Link className="pill" to="/welcome">↜ BETZO home</Link>
            <div className="eyebrow" style={{ marginTop: 18 }}>Welcome back</div>
            <h1 style={{ margin: '4px 0 6px' }}>Sign in</h1>
            <p className="muted" style={{ marginTop: 0 }}>Access your market workspace.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input name="email" type="email" autoComplete="username" required />
              </label>
              <label>
                Password
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
              <button className="btn primary" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <div className="auth-links">
              <Link className="auth-link" to="/forgot">Forgot password?</Link>
              <Link className="auth-link" to="/signup">Create account</Link>
            </div>
            <p className="auth-message" aria-live="polite">{message}</p>
            <p className="muted" style={{ fontSize: 13 }}>
              New to BETZO? <Link className="pill" to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
