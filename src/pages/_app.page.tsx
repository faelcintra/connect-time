import '../lib/dayjs'

import type { AppProps } from 'next/app'
import { globalDefault } from '../styles/global'
import { SessionProvider } from 'next-auth/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/react-query'

globalDefault()

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // pageProps  étudo que retorna dentro de getServerSideProps,
  // mas por padrao session é undefined, ate que cria uma function getServerSideProps
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  )
}
