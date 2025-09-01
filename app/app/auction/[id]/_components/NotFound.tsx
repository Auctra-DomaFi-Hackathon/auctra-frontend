'use client'

export default function NotFound({
  message,
  action,
}: {
  message: string
  action?: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Auction Not Found</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        {action}
      </div>
    </div>
  )
}
