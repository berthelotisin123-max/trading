import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getPreviewAccount, readPreviewProfile, updatePreviewAccountName, writePreviewProfile } from '../lib/auth';
import { ApiError, isOffline } from '../lib/api';

export default function Profile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement | null>(null);

  const account = getPreviewAccount();
  const [name, setName] = useState(profile.name ?? account?.name ?? '');
  const [message, setMessage] = useState('');
  const [photoStatus, setPhotoStatus] = useState('PNG, JPG, or WebP · up to 8 MB. Saved in this browser.');
  const photo = profile.photo;

  // Keep the name field in sync if the stored profile changes elsewhere.
  useEffect(() => {
    setName(profile.name ?? getPreviewAccount()?.name ?? '');
  }, [profile.name]);

  const email = account?.email ?? profile.email ?? '';
  const initial = (name.trim().charAt(0) || 'B').toUpperCase();

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage('Name cannot be empty.');
      return;
    }
    try {
      await updatePreviewAccountName(trimmed);
      refreshProfile();
      setMessage('Profile details saved to your BETZO account.');
      toast('Profile saved.');
    } catch (error) {
      if (isOffline(error)) {
        setMessage('Could not reach the BETZO backend. Check your connection and try again.');
      } else {
        setMessage(error instanceof ApiError ? error.message : 'Could not save your profile.');
      }
      toast('Profile could not be saved.');
    }
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setPhotoStatus('Choose a PNG, JPG, or WebP image up to 8 MB.');
      return;
    }

    try {
      const image = await createImageBitmap(file);
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      const scale = Math.max(size / image.width, size / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      image.close();
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      writePreviewProfile({ ...readPreviewProfile(), photo: dataUrl, name });
      refreshProfile();
      setPhotoStatus('Profile photo saved in this browser.');
      toast('Profile photo updated.');
    } catch {
      setPhotoStatus('This image could not be processed or saved. Try a smaller photo.');
    }
  };

  const handleRemovePhoto = () => {
    const next = readPreviewProfile();
    delete next.photo;
    writePreviewProfile(next);
    refreshProfile();
    setPhotoStatus('Profile photo removed.');
    toast('Profile photo removed.');
  };

  const handleTheme = (next: Theme) => {
    setTheme(next);
    toast(next === 'light' ? 'Light theme enabled.' : 'Dark theme enabled.');
  };

  const handleLogout = () => {
    signOut();
    toast('You have been signed out.');
    navigate('/welcome', { replace: true });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Profile &amp; preferences</h1>
          <p>Manage your BETZO account details and workspace appearance.</p>
        </div>
      </div>

      <div className="grid section-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Profile details</h2>
              <p>Your name and email live on the BETZO backend and sync across devices.</p>
            </div>
            <span className="tag neutral">BETZO account</span>
          </div>

          <div className="profile-photo-row">
            <div
              className="profile-photo"
              role="img"
              aria-label="Profile photo preview"
              style={photo ? { backgroundImage: `url(${JSON.stringify(photo)})` } : undefined}
            >
              {photo ? '' : initial}
            </div>
            <div>
              <div className="profile-photo-actions">
                <button className="btn" type="button" onClick={() => fileInput.current?.click()}>Upload photo</button>
                <button className="btn" type="button" onClick={handleRemovePhoto}>Remove photo</button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={handlePhotoChange}
                aria-label="Upload profile photo"
              />
              <p className="profile-photo-note" aria-live="polite">{photoStatus}</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSave}>
            <label>Name<input name="name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Email<input name="email" type="email" value={email} readOnly /></label>
            <div className="full"><button className="btn primary" type="submit">Save profile</button></div>
          </form>
          <p className="auth-message" aria-live="polite">{message}</p>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Appearance</h2>
              <p>Choose the workspace theme for this browser.</p>
            </div>
          </div>
          <div className="head-buttons">
            <button className="btn" type="button" onClick={() => handleTheme('dark')} aria-pressed={theme === 'dark'}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.5 15.2A8.6 8.6 0 0 1 8.8 3.5 8.7 8.7 0 1 0 20.5 15.2Z" />
              </svg>
              Dark mode
            </button>
            <button className="btn" type="button" onClick={() => handleTheme('light')} aria-pressed={theme === 'light'}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
              Light mode
            </button>
          </div>
          <p className="muted" style={{ marginTop: 14 }}>Current theme: {theme}</p>
          <div className="catalog-note" style={{ margin: 0 }}>
            Theme preference is stored in this browser. Profile details are saved to your account and follow you
            between devices.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h2>Password &amp; account recovery</h2>
            <p>Open the reset request page for this account email.</p>
          </div>
        </div>
        <button className="btn" type="button" onClick={() => navigate('/forgot', { state: { email } })}>
          <span aria-hidden="true">↗</span> Go to password reset
        </button>
        <p className="muted" style={{ marginTop: 10 }}>Email reset is not connected in this preview; no reset email can be sent yet.</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <h2>Session</h2>
            <p>End this signed-in session.</p>
          </div>
          <span className="tag warn">Signed in</span>
        </div>
        <button className="btn" type="button" onClick={handleLogout}>Log out</button>
        <p className="muted" style={{ marginTop: 10 }}>
          Logging out returns you to the welcome page and revokes this session on the server. Your BETZO account
          stays intact, so you can sign in again from any device.
        </p>
      </div>
    </>
  );
}
