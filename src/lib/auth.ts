export function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');

  // Use environment variables for secrets, with dev fallbacks
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authToken = process.env.AUTH_TOKEN;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];

  // In production, we require these to be set
  if (process.env.NODE_ENV === 'production') {
    return (adminPassword && token === adminPassword) || (authToken && token === authToken);
  }

  // Dev fallback
  return token === (adminPassword || 'admin') || token === (authToken || 'admin');
}
