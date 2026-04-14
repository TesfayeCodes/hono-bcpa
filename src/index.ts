import { Hono } from 'hono';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

const users: User[] = [];

const app = new Hono();

// 2. Get All Users
app.get('/users', (c) => {
  return c.json(users.map(({ password: _, ...safeUser }) => safeUser));
});

// 3. Get User by ID
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  const user = users.find((u) => u.id === id);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const { password: _, ...safeUser } = user;
  return c.json(safeUser);
});

// 4. Signup (Create User)
app.post('/signup', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { name, email, password } = body || {};

  if (!name || !email || !password) {
    return c.json({ error: 'name, email, and password are required' }, 400);
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return c.json({ error: 'Email already in use' }, 409);
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
  };

  users.push(newUser);

  const { password: _, ...safeUser } = newUser;
  return c.json(safeUser, 201);
});

// 5. Signin (Login)
app.post('/signin', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { email, password } = body || {};

  if (!email || !password) {
    return c.json({ error: 'email and password are required' }, 400);
  }

  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const { password: _, ...safeUser } = user;
  return c.json({ message: 'Signed in successfully', user: safeUser });
});

export default {
  port: 3000,
  fetch: app.fetch,
};

