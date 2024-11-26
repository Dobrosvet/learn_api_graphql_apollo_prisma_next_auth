import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import authorizationIsRequired from './app/authorizationIsRequired';

export function middleware(req: NextRequest) {
  // const authHeader = req.headers.get('authorization');

  const token = req.cookies.get('accessToken')?.value;

  // console.log('authHeader', authHeader)
  console.log('token', token)
  
  if (!token) {
    // Перенаправляем на страницу логина, если нет токена
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  try {
    // Если токен действителен, продолжаем обработку
    authorizationIsRequired(token)
    return NextResponse.next();
  } catch (err) {
    console.error('Invalid token:', err);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

// Указываем, для каких роутов будет применяться middleware
export const config = {
  matcher: ['/secure'],
  // matcher: ['/protected/:path*'], // Применяется для всех маршрутов, начинающихся с "/protected/"
};
