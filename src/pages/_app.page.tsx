import '../lib/dayjs'

import type { AppProps } from 'next/app'
import { globalDefault } from '../styles/global'
import { SessionProvider } from 'next-auth/react'

globalDefault()

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // pageProps  étudo que retorna dentro de getServerSideProps,
  // mas por padrao session é undefined, ate que cria uma function getServerSideProps
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
