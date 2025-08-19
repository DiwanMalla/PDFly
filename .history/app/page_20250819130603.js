import React from 'react'

export default function Home() {
  return (
    <main style={{fontFamily: 'system-ui, sans-serif', padding: 40}}>
      <h1>PDFly</h1>
      <p>Starter scaffold for the PDF SaaS platform.</p>
      <ul>
        <li><a href="/api/health">API Health</a></li>
        <li><a href="/tools/merge">Merge tool (coming soon)</a></li>
      </ul>
    </main>
  )
}
