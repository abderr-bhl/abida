import { NextRequest } from 'next/server';

export function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === process.env.AUTH_TOKEN;
}
