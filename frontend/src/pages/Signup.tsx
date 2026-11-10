import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { evaluatePasswordRules, passwordMeetsRules } from '../lib/auth';
import { ApiError, isOffline } from '../lib/api';

const DEFAULT_RULES = evaluatePasswordRules('');

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(
    'Your password is sent over HTTPS to the BETZO backend and stored as a salted bcrypt hash.',
  );
  const [busy, setBusy] = useState(false);

  const rules = evaluatePasswordRules(password);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const pwd = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');

    if (!passwordMeetsRules(pwd)) {
      setMessage('Password does not meet all five requirements. Please check the list above.');
      return;
    }
    if (pwd !== confirm) {
      setMessage('The passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await signUp(name, email, pwd);
      setMessage('Account created. Sign in to open your workspace.');
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      } else if (isOffline(error)) {
        setMessage('Could not reach the BETZO backend. Check your connection and try again.');
      } else {
        setMessage('Sign-up failed. Please try again in a moment.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="public-shell public-auth public-signup">
      <div className="public-content">
        <div className="auth-wrap">
          <div className="card">
            <Link className="pill" to="/welcome">↜ BETZO home</Link>
            <div className="eyebrow" style={{ marginTop: 18 }}>Start your workspace</div>
            <h1 style={{ margin: '4px 0 6px' }}>Create account</h1>
            <p className="muted" style={{ marginTop: 0 }}>
              Create a BETZO account on the production backend. Your credentials are verified server-side, and you
              can sign in from any device.
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input name="name" autoComplete="name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"
                  title="At least 8 characters, with uppercase, lowercase, number, and special character"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <div className="password-rules" aria-live="polite">
                {(rules.length ? rules : DEFAULT_RULES).map((rule) => (
                  <span key={rule.id} className={rule.ok ? 'ok' : ''}>{rule.label}</span>
                ))}
              </div>
              <label>
                Confirm password
                <input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required />
              </label>
              <button className="btn primary" type="submit" disabled={busy}>
                {busy ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p className="auth-message" aria-live="polite">{message}</p>
            <p className="muted" style={{ fontSize: 13 }}>
              Already registered? <Link className="pill" to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
