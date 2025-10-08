'use client'

// Force dynamic rendering for entire app
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OriginsRadio - Ankara's Interactive Radio Station</title>
        <meta name="description" content="OriginsRadio - Ankara's premier interactive radio station featuring live shows, music, events, and cultural experiences." />
        <link rel="canonical" href="https://originsradio.com/" />
        <link rel="icon" href="/favicon/favicon.ico" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="theme-color" content="#000000" />
        {/* IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG OR THIS VERY COMMENT! */}
        <script src="https://cdn.gpteng.co/gptengineer.js" type="module" async></script>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
