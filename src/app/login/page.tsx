import { signIn } from '@/app/auth/actions';
import { Permanent_Marker } from 'next/font/google';

const permanentMarker = Permanent_Marker({
  weight: ['400'],
  subsets: ['latin'],
});

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className='flex-col justify-center items-center h-screen flex gap-6 px-4 py-10 sm:px-6 lg:px-8'>
      <div className='w-full max-w-sm p-8 rounded-lg shadow-xl bg-gradient-to-br from-zinc-800 to-zinc-900'>
        <div className='flex justify-center'>
          <h1
            className={`${permanentMarker.className} text-5xl font-bold text-slate-200 drop-shadow-lg`}
          >
            CRM
          </h1>
        </div>

        <form className='mt-8 space-y-6'>
          <div className='relative'>
            <input
              className='peer placeholder-transparent h-10 w-full border-b-2 border-zinc-600 bg-transparent text-slate-200 focus:outline-none focus:border-blue-500'
              id='email'
              type='email'
              name='email'
              placeholder='Email'
              required
            />
            <label
              htmlFor='email'
              className='absolute left-0 -top-3.5 text-zinc-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-blue-500 peer-focus:text-sm'
            >
              Email
            </label>
          </div>
          <div className='relative'>
            <input
              className='peer placeholder-transparent h-10 w-full border-b-2 border-zinc-600 bg-transparent text-slate-200 focus:outline-none focus:border-blue-500'
              id='password'
              type='password'
              name='password'
              placeholder='Password'
              required
            />
            <label
              htmlFor='password'
              className='absolute left-0 -top-3.5 text-zinc-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-blue-500 peer-focus:text-sm'
            >
              Password
            </label>
          </div>
          <button
            formAction={signIn}
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out'
          >
            Sign In
          </button>
          {searchParams?.message && (
            <p className='mt-2 text-center text-sm text-red-500'>
              {searchParams.message}
            </p>
          )}
        </form>
      </div>

      <p className='text-zinc-500 text-sm'>
        Hint: In a real app, you'd have 'Forgot password?' and 'Sign up' links.
      </p>
    </div>
  );
}