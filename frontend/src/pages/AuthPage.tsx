import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers3,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

interface Props {
  mode: 'login' | 'register';
}

interface AuthLocationState {
  from?: {
    pathname?: string;
  };
  message?: string;
  email?: string;
}

export default function AuthPage({ mode }: Props) {
  const isRegister = mode === 'register';

  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as AuthLocationState | null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState(locationState?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const successMessage = !isRegister
    ? locationState?.message
    : undefined;

  const from = locationState?.from?.pathname ?? '/dashboard';

  if (loading) {
    return (
      <main className="auth-layout">
        <section className="auth-panel">
          <div className="auth-panel-inner">
            <p>Checking your session...</p>
          </div>
        </section>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await signUp(name.trim(), email.trim(), password);

  
        navigate('/login', {
          replace: true,
          state: {
            message: 'Account created successfully. Please sign in.',
            email: email.trim(),
          },
        });

        return;
      }


      await signIn(email.trim(), password);

      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <div className="visual-glow glow-one" />
        <div className="visual-glow glow-two" />

        <Link to="/login" className="brand brand-light">
          <span className="brand-mark">
            <Layers3 size={20} />
          </span>
          <span>
            taskflow<span className="brand-period">.</span>
          </span>
        </Link>

        <div className="visual-content">
          <div className="pill pill-glass">
            <Sparkles size={14} />
            A calmer way to get things done
          </div>

          <h1>
            Make space for
            <br />
            <span>meaningful work.</span>
          </h1>

          <p>
            Bring your tasks together, find your focus, and make steady
            progress on what matters most.
          </p>

          <div className="visual-points">
            <div>
              <CheckCircle2 size={17} />
              A clear view of your day
            </div>
            <div>
              <CheckCircle2 size={17} />
              Small steps, real momentum
            </div>
            <div>
              <CheckCircle2 size={17} />
              Your work, all in one place
            </div>
          </div>
        </div>

        <div className="visual-footer">
          <span>Less juggling. More doing.</span>
          <span>© 2026 Taskflow</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand">
            <span className="brand-mark">
              <Layers3 size={19} />
            </span>
            taskflow<span className="brand-period">.</span>
          </div>

          <div className="auth-intro">
            <span className="eyebrow">
              {isRegister
                ? 'YOUR NEXT CHAPTER STARTS HERE'
                : 'WELCOME BACK'}
            </span>

            <h2>
              {isRegister
                ? 'Create your workspace'
                : 'Good to see you again'}
            </h2>

            <p>
              {isRegister
                ? 'Set up your account and start getting things done.'
                : 'Sign in to pick up right where you left off.'}
            </p>
          </div>

          <form className="form-stack auth-form" onSubmit={submit}>
            {isRegister && (
              <label className="field">
                <span>Full name</span>
                <div className="input-wrap">
                  <input
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>
              </label>
            )}

            <label className="field">
              <span>Email address</span>
              <div className="input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    isRegister ? 'new-password' : 'current-password'
                  }
                  placeholder={
                    isRegister
                      ? 'At least 12 characters'
                      : 'Enter your password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={isRegister ? 12 : 1}
                  maxLength={72}
                  required
                />

                <button
                  className="reveal-button"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              {isRegister && (
                <small className="field-hint">
                  Use at least 12 characters for a stronger password.
                </small>
              )}
            </label>

            {successMessage && (
              <div className="form-success" role="status">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="button button-primary button-wide"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait…'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}

              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-switch">
            {isRegister
              ? 'Already have an account?'
              : 'New to Taskflow?'}

            {' '}

            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </div>

          <div className="auth-security">
            <LockKeyhole size={14} />
            Your account is protected with secure authentication.
          </div>
        </div>
      </section>
    </main>
  );
}