'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'anniv_auth';
const USERS_KEY = 'anniv_users';
const ONBOARD_KEY = 'mm_onboarded';
const DEFAULT_USERS = [{ id: 'admin', password: '1234' }];

const AuthContext = createContext({
  isAuthed: false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthGate({ children }) {
  const memoryRef = useRef({
    users: [...DEFAULT_USERS],
    authed: false,
    onboarded: false,
  });
  const [isAuthed, setIsAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mode, setMode] = useState('login');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const storage = safeStorage();
    if (storage) {
      const storedUsers = storage.getItem(USERS_KEY);
      if (!storedUsers) {
        storage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
      const onboarded = storage.getItem(ONBOARD_KEY);
      if (onboarded !== '1') {
        setShowOnboarding(true);
      }
      const stored = storage.getItem(STORAGE_KEY);
      if (stored === '1') {
        setIsAuthed(true);
      }
    } else {
      if (!memoryRef.current.onboarded) {
        setShowOnboarding(true);
      }
      if (memoryRef.current.authed) {
        setIsAuthed(true);
      }
    }
    setReady(true);
  }, []);

  function safeStorage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  function readUsers() {
    try {
      const storage = safeStorage();
      if (storage) {
        const raw = storage.getItem(USERS_KEY);
        if (!raw) return [...DEFAULT_USERS];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [...DEFAULT_USERS];
        return parsed;
      }
      return [...memoryRef.current.users];
    } catch {
      return [...DEFAULT_USERS];
    }
  }

  function writeUsers(users) {
    const storage = safeStorage();
    if (storage) {
      storage.setItem(USERS_KEY, JSON.stringify(users));
      return;
    }
    memoryRef.current.users = [...users];
  }

  function handleLogin(event) {
    event.preventDefault();
    const id = loginId.trim();
    const users = readUsers();
    const ok = users.some((user) => user.id === id && user.password === loginPassword);
    if (!ok) {
      setError('아이디 또는 비밀번호가 올바르지 않아요.');
      setInfo('');
      return;
    }
    const storage = safeStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, '1');
    } else {
      memoryRef.current.authed = true;
    }
    setError('');
    setInfo('');
    setIsAuthed(true);
  }

  function handleSignup(event) {
    event.preventDefault();
    const id = loginId.trim();
    if (id.length < 3) {
      setError('아이디는 3자 이상 입력해 주세요.');
      setInfo('');
      return;
    }
    if (loginPassword.length < 4) {
      setError('비밀번호는 4자 이상 입력해 주세요.');
      setInfo('');
      return;
    }
    if (loginPassword !== confirmPassword) {
      setError('비밀번호 확인이 일치하지 않아요.');
      setInfo('');
      return;
    }

    const users = readUsers();
    if (users.some((user) => user.id === id)) {
      setError('이미 존재하는 아이디예요.');
      setInfo('');
      return;
    }

    users.push({ id, password: loginPassword });
    writeUsers(users);
    const storage = safeStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, '1');
    } else {
      memoryRef.current.authed = true;
    }
    setError('');
    setInfo('');
    setIsAuthed(true);
  }

  function logout() {
    const storage = safeStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    } else {
      memoryRef.current.authed = false;
    }
    setIsAuthed(false);
    setMode('login');
    setLoginId('');
    setLoginPassword('');
    setConfirmPassword('');
    setError('');
    setInfo('');
  }

  function closeOnboarding() {
    const storage = safeStorage();
    if (storage) {
      storage.setItem(ONBOARD_KEY, '1');
    } else {
      memoryRef.current.onboarded = true;
    }
    setShowOnboarding(false);
  }

  const contextValue = useMemo(() => ({ isAuthed, logout }), [isAuthed]);

  if (!ready) {
    return <div className="auth-skeleton" aria-hidden="true" />;
  }

  if (!isAuthed) {
    const isSignup = mode === 'signup';

    return (
      <div className="auth-gate">
        {showOnboarding && (
          <div className="auth-onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
            <div className="auth-onboarding-backdrop" onClick={closeOnboarding} aria-hidden="true" />
            <div className="auth-onboarding-card">
              <div className="auth-onboarding-header">
                <span className="auth-onboarding-star" aria-hidden="true">
                  ★
                </span>
                <span className="auth-onboarding-page">1페이지</span>
              </div>
              <p id="onboarding-title" className="auth-onboarding-text">
                여기는 UXUI 취준 중인 밍밍스타가 다양한 테스트롤하는 공간이야!
              </p>
              <button className="auth-onboarding-close" type="button" onClick={closeOnboarding}>
                입장하기
              </button>
            </div>
          </div>
        )}

        <div className="auth-card">
          <p className="auth-kicker">Member Only</p>
          <h1 className="auth-title">{isSignup ? '회원가입하기' : '로그인하고 들어가기'}</h1>
          <p className="auth-subtitle">
            {isSignup ? '계정을 만들면 바로 이용할 수 있어요.' : '로그인 후 원하는 화면으로 이동할 수 있어요.'}
          </p>

          <div className="auth-switch">
            <button
              type="button"
              className={`auth-toggle ${!isSignup ? 'is-active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
                setInfo('');
              }}
            >
              로그인
            </button>
            <button
              type="button"
              className={`auth-toggle ${isSignup ? 'is-active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
                setInfo('');
              }}
            >
              회원가입
            </button>
          </div>

          <form className="auth-form" onSubmit={isSignup ? handleSignup : handleLogin}>
            <label htmlFor="auth-id">아이디</label>
            <input
              id="auth-id"
              name="auth-id"
              autoComplete="username"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />

            <label htmlFor="auth-password">비밀번호</label>
            <input
              id="auth-password"
              name="auth-password"
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />

            {isSignup && (
              <>
                <label htmlFor="auth-password-confirm">비밀번호 확인</label>
                <input
                  id="auth-password-confirm"
                  name="auth-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </>
            )}

            {error && <p className="auth-error">{error}</p>}
            {info && <p className="auth-info">{info}</p>}

            <button className="auth-button" type="submit">
              {isSignup ? '회원가입' : '로그인'}
            </button>
            {isSignup ? (
              <p className="auth-hint">아이디 3자 이상, 비밀번호 4자 이상</p>
            ) : (
              <p className="auth-hint">기본 계정: admin / 1234</p>
            )}
            <button
              type="button"
              className="auth-onboarding-link"
              onClick={() => {
                setShowOnboarding(true);
              }}
            >
              온보딩 다시보기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <button className="auth-logout" type="button" onClick={logout}>
        로그아웃
      </button>
      {children}
    </AuthContext.Provider>
  );
}
