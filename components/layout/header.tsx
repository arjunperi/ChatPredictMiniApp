import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ChatPredict
            </h1>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/markets"
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Markets
            </Link>
            <Link
              href="/leaderboard"
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Leaderboard
            </Link>
            <a 
              href="https://t.me/APChatPredictBot" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              Open Bot
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

