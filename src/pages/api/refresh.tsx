import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.REFRESH_SECRET!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token missing' })
  }

  try {
    // Проверяем refresh-токен
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { username: string }

    // Создаем новый access-токен
    const newAccessToken = jwt.sign(
      { username: decoded.username },
      SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken: newAccessToken })
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}
