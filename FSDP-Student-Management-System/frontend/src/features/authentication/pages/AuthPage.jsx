import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, roleHome } from '../../../app/providers.jsx';
import { mutate } from '../../../shared/lib/api.js';
import { Field, Notice } from '../../../shared/components/ui.jsx';
export default function AuthPage({ register = false }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { updateUser } = useApp();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    if (register && form.get('password') !== form.get('confirm')) {
      setError('Passwords must match.');
      setBusy(false);
      return;
    }
    try {
      const user = await mutate(
        register ? '/auth/register' : '/auth/login',
        Object.fromEntries(form),
      );
      updateUser(user);
      const selected = sessionStorage.getItem('fsdp.intendedSession');
      navigate(
        register
          ? '/enrolment'
          : user.role === 'student' && selected
            ? '/student/classes'
            : roleHome(user),
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-story">
        <span className="eyebrow">WELCOME TO YOUR NEXT CHAPTER</span>
        <h2>
          Every journey
          <br />
          starts with
          <br />
          <em>one step.</em>
        </h2>
        <p>Your training, your community, your progress. All connected.</p>
      </div>
      <div className="auth-card">
        <span className="eyebrow">AIKIDO SHINJU-KAI</span>
        <h1>{register ? 'Create your account' : 'Welcome back.'}</h1>
        <p>
          {register
            ? 'Begin your membership application.'
            : 'Sign in to continue your practice.'}
        </p>
        <form onSubmit={submit}>
          {register && (
            <Field
              label="Full name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          )}
          <Field
            label="Email address"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            minLength={10}
            maxLength={100}
            autoComplete={register ? 'new-password' : 'current-password'}
          />
          {register && (
            <Field
              label="Confirm password"
              name="confirm"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
            />
          )}
          <Notice error>{error}</Notice>
          <button className="red wide" disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account →' : 'Sign in →'}
          </button>
        </form>
        <p>
          {register ? 'Already registered?' : 'New to the community?'}{' '}
          <Link className="text-link" to={register ? '/login' : '/register'}>
            {register ? 'Sign in' : 'Create account'}
          </Link>
        </p>
        {!register && (
          <details>
            <summary>Development demo accounts</summary>
            <p>
              admin@fsdp.demo / instructor-central@fsdp.demo / jamie@fsdp.demo /
              near@fsdp.demo / pending@fsdp.demo
            </p>
            <p>Password: AikidoDemo!2026</p>
          </details>
        )}
      </div>
    </div>
  );
}
