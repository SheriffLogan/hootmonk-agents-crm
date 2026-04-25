import { call, put, takeLatest } from 'redux-saga/effects';
import { login, logout } from '../../helpers/api/auth';
import { SESSION_KEY } from '../../helpers/api/apiCore';
import {
  loginRequest, loginSuccess, loginFailure,
  logoutRequest, logoutSuccess, logoutFailure,
} from './authSlice';

function* handleLogin({ payload: { email, password, navigate } }) {
  try {
    const data = yield call(login, { email, password });
    // Persist session
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    yield put(loginSuccess(data));
    // Smart redirect: send users straight to their first agent
    const agents  = data?.user?.subscribedAgents ?? [];
    const isAdmin = data?.user?.role === 'admin';
    if (isAdmin || agents.includes('financial-advisor')) {
      navigate('/financial-advisor/dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    const message = err?.response?.data?.message ?? 'Invalid credentials. Please try again.';
    yield put(loginFailure(message));
  }
}

function* handleLogout({ payload: { navigate } }) {
  try {
    yield call(logout);
  } catch (_) { /* ignore */ }
  sessionStorage.removeItem(SESSION_KEY);
  yield put(logoutSuccess());
  navigate('/auth/login');
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type,  handleLogin);
  yield takeLatest(logoutRequest.type, handleLogout);
}
