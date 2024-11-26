import { jwtDecode } from 'jwt-decode';

/**
 * Сохраняет токены в localStorage.
 * @param accessToken - Access-токен.
 * @param refreshToken - Refresh-токен.
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Проверка авторизации: проверяет наличие и валидность токена.
 * @returns {string | null} - Валидный токен или `null`, если токен не валиден.
 */
export const checkAuth = (): string | null => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    console.error('Требуется авторизация!');
    return null;
  }

  try {
    const { exp } = jwtDecode(accessToken) as { exp: number };
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      console.error('Токен истёк. Требуется обновление.');
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('Неверный токен:', error);
    return null;
  }
};

/**
 * Обновление токена.
 * @returns {Promise<string | null>} - Новый access-токен или `null`, если обновление не удалось.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    console.error('Отсутствует refresh-токен.')
    return null
  }

  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      console.error('Ошибка обновления токена:', response.statusText)
      return null
    }

    const data = await response.json()
    const newAccessToken = data.accessToken
    const newRefreshToken = data.refreshToken

    // Сохраняем обновленные токены
    setTokens(newAccessToken, newRefreshToken)

    return newAccessToken
  } catch (error) {
    console.error('Ошибка обновления токена:', error)
    return null
  }
};

/**
 * Получение валидного токена с обновлением при необходимости.
 * @returns {Promise<string | null>} - Валидный токен или `null`.
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  let token = checkAuth()
  if (!token) {
    token = await refreshAccessToken()
  }
  return token
};

/**
 * Универсальный GraphQL-запрос.
 * @param query - GraphQL-запрос.
 * @param variables - Переменные запроса.
 * @returns {Promise<any>} - Ответ от сервера.
 */
export const sendAuthGraphQLRequest = async (query: string, variables = {}): Promise<unknown> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { error: 'Требуется авторизация!' }
  }

  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.error('Ошибка GraphQL-запроса:', response.statusText);
      return { error: response.statusText };
    }

    const data = await response.json();
    if (data.errors) {
      console.error('Ошибки GraphQL:', data.errors);
      return { error: data.errors };
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка отправки GraphQL-запроса:', error);
      return { error: error.message };
    } else {
      console.error('Неизвестная ошибка:', error);
      return { error: 'Неизвестная ошибка' };
    }
  }
};
