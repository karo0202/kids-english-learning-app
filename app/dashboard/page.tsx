export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-800 mb-4">🎉</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Dashboard Working!</h2>
        <p className="text-xl text-gray-600 mb-6">The dashboard is now accessible and working properly.</p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-sm text-gray-500">Deployment successful at: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}