import { authActions } from '@/stores/authStore';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const [username, setUser] = useState('');
  const [password, setPsswd] = useState('');

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch('http://localhost:8000/api/v1/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        alert('Login failed');
      }
    }).then((data) => {
      if (data) {
        authActions.setAccessToken(data.access);
        router.navigate({ to: '/' });
      }
    });
  };

  return (
    <div>
      Hello "/login"!
      <form onSubmit={onSubmit}>
        <label>username</label>
        <input type='text' value={username} onChange={(e) => setUser(e.target.value)} />
        <label>password</label>
        <input type='text' value={password} onChange={(e) => setPsswd(e.target.value)} />
        <button type='submit'>login</button>
      </form>
    </div>
  );
}
