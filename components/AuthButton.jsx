'use client';

import React from 'react';

export default function AuthButton({ session }) {
  if (session?.user) {
    return (
      <div className="auth-user">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="auth-avatar"
            width={32}
            height={32}
          />
        )}
        <span className="auth-name">{session.user.name || session.user.email}</span>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="auth-btn auth-btn-signout">
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <a href="/signin" className="auth-btn auth-btn-signin">
      Sign In
    </a>
  );
}
