export function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  return token === password;
}
