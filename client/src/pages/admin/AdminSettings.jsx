import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Two-step flow:
//   1. Admin fills in the changes they want and requests a verification code.
//   2. A 6-digit code is sent to their email + WhatsApp; entering it applies
//      the changes. A fresh JWT is returned so they stay signed in.
export default function AdminSettings() {
  const { admin, applyAccountUpdate } = useAuth();

  const [profile, setProfile] = useState({ username: '', email: '', phone: '' });
  const [form, setForm] = useState({
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    phone: '',
  });

  const [step, setStep] = useState('edit'); // 'edit' | 'verify'
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState([]);
  const [devCode, setDevCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current profile to prefill contact fields.
  useEffect(() => {
    api.get('/auth/me', true).then(({ admin: a }) => {
      setProfile(a);
      setForm((f) => ({ ...f, email: a.email || '', phone: a.phone || '' }));
    });
  }, []);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validateEdits() {
    if (
      !form.newUsername &&
      !form.newPassword &&
      form.email === (profile.email || '') &&
      form.phone === (profile.phone || '')
    ) {
      return 'Change at least one field before requesting a code.';
    }
    if (form.newPassword && form.newPassword.length < 6) {
      return 'New password must be at least 6 characters.';
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  }

  async function requestCode(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const v = validateEdits();
    if (v) return setError(v);

    setBusy(true);
    try {
      const res = await api.post('/auth/account/request-code', {}, true);
      setSentTo(res.sentTo || []);
      setDevCode(res.devCode || '');
      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitUpdate(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = { code };
      if (form.newUsername) payload.newUsername = form.newUsername;
      if (form.newPassword) payload.newPassword = form.newPassword;
      if (form.email !== (profile.email || '')) payload.email = form.email;
      if (form.phone !== (profile.phone || '')) payload.phone = form.phone;

      const res = await api.post('/auth/account/update', payload, true);
      applyAccountUpdate(res);
      setProfile(res.admin);
      setSuccess('✅ Account updated successfully.');
      setStep('edit');
      setCode('');
      setDevCode('');
      setForm((f) => ({
        ...f,
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
        email: res.admin.email || '',
        phone: res.admin.phone || '',
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-3xl font-bold text-forest-800">⚙️ Account Settings</h1>
      <p className="mt-1 text-forest-600">
        Signed in as <strong>{admin?.username}</strong>. Changes require a
        verification code sent to your email and WhatsApp.
      </p>

      {success && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === 'edit' ? (
        <form onSubmit={requestCode} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label" htmlFor="nu">New username</label>
            <input
              id="nu"
              className="input"
              placeholder={profile.username}
              value={form.newUsername}
              onChange={(e) => setField('newUsername', e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="np">New password</label>
              <input
                id="np"
                type="password"
                className="input"
                placeholder="Leave blank to keep"
                value={form.newPassword}
                onChange={(e) => setField('newPassword', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="cp">Confirm password</label>
              <input
                id="cp"
                type="password"
                className="input"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-cream-200 pt-4">
            <p className="mb-3 text-sm font-medium text-forest-700">
              Where codes are sent (update if needed):
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="em">Email</label>
                <input
                  id="em"
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="ph">WhatsApp number</label>
                <input
                  id="ph"
                  className="input"
                  placeholder="+65..."
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Sending code…' : 'Send verification code'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitUpdate} className="card mt-6 space-y-4 p-6">
          <div className="rounded-lg bg-cream-100 px-4 py-3 text-sm text-forest-700">
            <p>📨 A 6-digit code was sent to:</p>
            <ul className="mt-1 font-medium">
              {sentTo.map((s) => (
                <li key={s.channel}>
                  {s.channel === 'email' ? '📧' : '💬'} {s.to}
                </li>
              ))}
            </ul>
            {devCode && (
              <p className="mt-2 rounded bg-saffron-100 px-3 py-2 text-saffron-800">
                🔧 Dev mode (no email/WhatsApp provider configured) — your code is{' '}
                <strong className="font-mono text-base">{devCode}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="code">Verification code</label>
            <input
              id="code"
              className="input text-center font-mono text-2xl tracking-[0.4em]"
              maxLength={6}
              inputMode="numeric"
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => {
                setStep('edit');
                setCode('');
                setError('');
              }}
            >
              ← Back
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={busy || code.length < 6}>
              {busy ? 'Verifying…' : 'Confirm changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
