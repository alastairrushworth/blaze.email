import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" /> {/* Corrected path to favicon */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
