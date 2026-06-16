import { headers } from 'next/headers';

export async function checkAuth() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];

  // Simple token check against environment variable
  const secretToken = process.env.AUTH_TOKEN || 'dev-token-123';

  return token === secretToken;
}
