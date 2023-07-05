import type { AppProps } from 'next/app'
import { globalDefault } from '../styles/global'
import { SessionProvider } from 'next-auth/react'

globalDefault()

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
