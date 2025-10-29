export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">✅ Test Page Working!</h1>
        <p className="text-green-600">If you can see this, the deployment is working.</p>
        <p className="text-sm text-gray-600 mt-4">Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
