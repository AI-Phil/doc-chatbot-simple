'use client'

import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File>()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    try {
      const data = new FormData()
      data.set('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      // handle the error
      if (!res.ok) throw new Error(await res.text())
    } catch (e: any) {
      // Handle errors here
      console.error(e)
    }
  }

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={onSubmit} className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
        <input
          className="file:border file:border-gray-300 file:rounded-lg file:text-sm file:px-4 file:py-2 file:cursor-pointer file:transition-colors file:duration-200 hover:file:bg-blue-100"
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <input
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          type="submit"
          value="Upload"
        />
      </form>
    </main>
  )
}