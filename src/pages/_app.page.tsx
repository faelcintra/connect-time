import type { AppProps } from 'next/app'
import { globalDefault } from '../styles/global'

globalDefault()

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
