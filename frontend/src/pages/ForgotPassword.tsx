import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPreviewAccount, readPreviewProfile } from '../lib/auth';

export default function ForgotPassword() {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const initialEmail =
    stateEmail ?? getPreviewAccount()?.email ?? readPreviewProfile().email ?? '';

  const [message, setMessage] = useState(
    'Password reset email is not configured in this preview, so no message can be sent.',
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(
      'Password reset is unavailable: BETZO has no verified-email service in this preview, so no reset link was sent. In production, request a time-limited link sent to your verified email.',
    );
  };

  return (
    <div className="public-shell">
      <div className="public-content">
        <div className="auth-wrap" style={{ padding: '48px 0' }}>
          <div className="card">
            <Link className="pill" to="/login">↝ Back to sign in</Link>
            <div className="eyebrow" style={{ marginTop: 18 }}>Account recovery</div>
            <h1 style={{ margin: '4px 0 6px' }}>Forgot password?</h1>
            <p className="muted" style={{ marginTop: 0 }}>
              Enter the email address on your account. In a production BETZO account, we would send
              a time-limited reset link after verifying the address.
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" defaultValue={initialEmail} required />
              </label>
              <button className="btn primary" type="submit">Request reset link</button>
            </form>
            <p className="auth-message" aria-live="polite">{message}</p>
            <div className="catalog-note" style={{ margin: 0 }}>
              For security, password recovery must verify control of the account email. This
              browser-only preview cannot verify email ownership or reset an account password.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
