interface Props {
  preparedness: string[]
}

export default function PreparednessBox({ preparedness }: Props) {
  return (
    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-5 my-6">
      <h3 className="font-bold text-green-800 text-lg mb-4 flex items-center gap-2">
        <span>✅</span>
        今日からできる備え
      </h3>
      <ul className="space-y-3">
        {preparedness.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 text-green-600 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <p className="text-sm text-green-900 leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
