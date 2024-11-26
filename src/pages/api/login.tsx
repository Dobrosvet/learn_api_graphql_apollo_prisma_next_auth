import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.REFRESH_SECRET!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, password } = req.body

  // Имитация подучения данных из БД
  const db = {
    username: 'admin',
    password: 'password'
  }

  // Здесь проверяем пользователя (например, через базу данных) и создаём токен
  if (username === db.username && password === db.password) {
    const accessToken = jwt.sign({ username }, SECRET, { expiresIn: '1h' })
    const refreshToken = jwt.sign({ username }, REFRESH_SECRET, { expiresIn: '7d' })

    // Продолжительность существования токена
    // 60 секунд * 60 минут * 24 часа * 7 дней = 7 дней в секундах
    const refreshTokenLifeTime = 604800
    // Устанавливаем refresh-токен в cookie
    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; SameSite=None; Path=/; Max-Age=${refreshTokenLifeTime}; Secure`);
    
    const accessTokenLifeTime = 3600
    // Сохраняем токен в cookie
    res.setHeader('Set-Cookie', `accessToken=${accessToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${accessTokenLifeTime}; Secure`);

    return res.status(200).json({ accessToken, refreshToken })
  }

  res.status(401).json({ message: 'Unauthorized' })
}
