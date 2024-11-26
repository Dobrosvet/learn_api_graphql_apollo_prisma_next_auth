'use client'

import Image from "next/image"
import { useState } from "react"
import { jwtDecode } from 'jwt-decode'
import { setTokens } from "@/utils/auth"
import { Block } from "@prisma/client"

export const try_auth = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      console.error('Ошибка авторизации:', response.statusText);
      return { error: 'Ошибка авторизации' };
    }

    const data = await response.json();
    if (data.accessToken && data.refreshToken) {
      // Сохраняем токены в localStorage
      setTokens(data.accessToken, data.refreshToken);
      return { success: true };
    } else {
      console.error('Токены не были получены.');
      return { error: 'Токены отсутствуют в ответе сервера' };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка при попытке авторизации:', error.message);
      return { error: error.message };
    } else {
      console.error('Неизвестная ошибка:', error);
      return { error: 'Неизвестная ошибка' };
    }
  }
}


export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [id, setId] = useState('')
  const [content, setContent] = useState('')

  const [infoLogin, setInfoLogin] = useState('Информация по входу')
  const [infoBlock, setInfoBlock] = useState('Информация по блоку')



  // ============

  const getBlock = () => {
    fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `query {
          blocks {
              id
              content
              from {
                  id
              }
              to {
                  id
              }
          }
      }`
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)

        const block = data?.data?.blocks?.find((block: Block) => block.id === id)

        setContent(block.content)
        setInfoBlock(JSON.stringify(block))
      })
      .catch((error) => {
        console.error('Ошибка в изменении блока', error)
      });
  }

  // ============

  const loadProtectedFunction = async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      alert('Требуется авторизация!');
      return;
    }

    try {
      const { exp } = jwtDecode(accessToken) as { exp: number };
      const now = Math.floor(Date.now() / 1000);
      if (exp < now) {
        alert('Токен истёк. Требуется повторная авторизация!');
        return;
      }
    } catch {
      alert('Неверный токен. Авторизация невозможна!');
      return;
    }

    const { protectedFunction } = await import('./../components/protectedFunction');

    const result = await protectedFunction(id, content);
    if (result.error) {
      setInfoBlock(`Ошибка: ${result.error}`);
    } else {
      setInfoBlock(`Изменения сохранены: ${JSON.stringify(result)}`);
    }
  };


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="w-[400px] flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="w-full flex flex-col gap-2">
          <div className="w-[400px]">Авторизируйтесь что бы сохранять данные в БД</div>
          <input value={username} onChange={e => setUsername(e.target.value)} id="username" type="text" placeholder="Логин" className="p-2 rounded-md text-black" />
          <input value={password} onChange={e => setPassword(e.target.value)} id="password" type="text" placeholder="Пароль" className="p-2 rounded-md text-black" />
          <button onClick={async () => setInfoLogin(JSON.stringify(await try_auth(username, password)))} className="w-full p-2 bg-green-700 rounded-md">Войти</button>
          <div id="info_login" className="h-20 p-2 border border-solid border-white rounded-md break-words overflow-x-scroll">{infoLogin}</div>
          <a className="p-2 bg-orange-700 rounded-md" href="/secure">Секретная страница (только авторизированным пользователям)</a>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div>
            Вставьте идентификатор блока и нажмите &quot;Загрузка&quot;, для загрузки данных из базы данных.
            Измените содержимое блока и нажмите &quot;Сохранить&quot; для сохранения изменений в базу данных (доступно только авторизированным пользователям)
          </div>
          <input value={id} onChange={e => setId(e.target.value)} id="block_id" type="text" placeholder="Блок. ID" className="p-2 rounded-md text-black" />
          <input value={content} onChange={e => setContent(e.target.value)} id="block_content" type="text" placeholder="Блок. Content" className="p-2 rounded-md text-black" />
          <div className="flex gap-2">
            <button onClick={getBlock} className="w-full p-2 bg-blue-700 rounded-md">Загрузать</button>
            <button onClick={loadProtectedFunction} className="w-full p-2 bg-green-700 rounded-md">Сохранить</button>
          </div>
          <div id="info_block" className="h-20 p-2 border border-solid border-white rounded-md break-words overflow-x-scroll">{infoBlock}</div>
        </div>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
