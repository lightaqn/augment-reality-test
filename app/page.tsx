import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="space-y-12">
          <h1 className="text-4xl font-semibold">Vocational AR/AI Coach</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            <header className="flex items-center justify-between px-4 py-2 rounded-2xl border-4 border-blue-800 hover:cursor-pointer hover:transition hover:transform hover: ease-in-out hover:scale-105">
              <h2 className="text-2xl font-semibold">MediaPipe</h2>
              <nav className="space-x-3">
                <Link href="/armp" className="text-sm text-blue-600">
                  Open
                </Link>
              </nav>
            </header>
            <header className="flex items-center justify-between px-4 py-2 rounded-2xl border-4 border-blue-800 hover:cursor-pointer hover:transition hover:transform hover: ease-in-out hover:scale-105">
              <h2 className="text-2xl font-semibold">MoveNet</h2>
              <nav className="space-x-3">
                <Link href="/armn" className="text-sm text-blue-600">
                  Open
                </Link>
              </nav>
            </header>
          </div>

          <section className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="font-medium">Overview</h2>
            <p className="text-lg text-gray-600 mt-2">
              Open this on a phone or tablet. The AR Coach uses your camera and
              either MediaPipe or MoveNet to detect hand and body landmarks and
              gives real-time voice and text feedback using simple rules
              (handwashing, PPE prompts, idle warnings, posture hints).
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium">Requirements</h3>
              <ul className="list-disc pl-5 text-lg text-gray-600 mt-2">
                <li>HTTPS or localhost</li>
                <li>Modern mobile browser (Chrome, Safari)</li>
                <li>Camera permission</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium">Tips</h3>
              <ul className="list-disc pl-5 text-lg text-gray-600 mt-2">
                <li>Good lighting improves detection</li>
                <li>
                  Keep the full upper body in frame for PPE/transfer training
                </li>
                <li>Test on both iPhone and Android</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
