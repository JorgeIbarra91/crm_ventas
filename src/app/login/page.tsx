'use client';

import { signIn } from '@/app/auth/actions';
import { Permanent_Marker } from 'next/font/google';
import { useSearchParams } from 'next/navigation';

const permanentMarker = Permanent_Marker({
  weight: ['400'],
  subsets: ['latin'],
});

export default function Login() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-zinc-900 px-4 py-10 text-slate-200 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-zinc-800 p-8 shadow-2xl'>
        <div className='flex flex-col items-center'>
          <h1
            className={`${permanentMarker.className} mb-4 text-6xl font-bold text-slate-100 drop-shadow-lg`}
          >
            CRM
          </h1>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-slate-300'>
            Inicia sesión en tu cuenta
          </h2>
        </div>

        <form className='mt-8 space-y-6'>
          <div className='relative'>
            <input
              className='peer block w-full appearance-none border-0 border-b-2 border-zinc-600 bg-transparent px-0 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-0'
              id='email'
              type='email'
              name='email'
              placeholder=' '
              required
            />
            <label
              htmlFor='email'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-zinc-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-500'
            >
              Email
            </label>
          </div>
          <div className='relative'>
            <input
              className='peer block w-full appearance-none border-0 border-b-2 border-zinc-600 bg-transparent px-0 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-0'
              id='password'
              type='password'
              name='password'
              placeholder=' '
              required
            />
            <label
              htmlFor='password'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-zinc-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-500'
            >
              Password
            </label>
          </div>
          <button
            formAction={signIn}
            className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Sign In
          </button>
          {message && (
            <p className='mt-2 text-center text-sm text-red-500'>
              {message}
            </p>
          )}
        </form>
      </div>

      <p className='mt-8 text-center text-sm text-zinc-500'>
        Sugerencia: En una aplicación real, tendrías enlaces para '¿Olvidaste tu contraseña?' y 'Registrarse'.
      </p>
    </div>
  );
}
