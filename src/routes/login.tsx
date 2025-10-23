import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const [user, setUser] = useState('');
  const [psswd, setPsswd] = useState('');

  const onSubmit = async () => {
    const res = await fetch('http://localhost:8000/api/v1/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: user, password: psswd }),
    });
    if (res.ok) throw redirect({ to: '/' });
  };

  return (
    <div>
      Hello "/login"!
      <form>
        <label>username</label>
        <input type='text' value={user} onChange={(e) => setUser(e.target.value)} />
        <label>password</label>
        <input type='text' value={psswd} onChange={(e) => setPsswd(e.target.value)} />
        <button onClick={onSubmit}>login</button>
      </form>
    </div>
  );
}
