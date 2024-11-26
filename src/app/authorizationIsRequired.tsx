'use server'

import jwt from 'jsonwebtoken'

// Функция для проверки токена
export default async function authorizationIsRequired(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided')
  }
  const token = authHeader.split(' ')[1]
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!)
    return user; // Возвращает данные пользователя, если токен валиден
  } catch {
    throw new Error('Unauthorized: Invalid token')
  }
}