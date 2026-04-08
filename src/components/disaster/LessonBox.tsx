interface Props {
  lessons: string[]
}

export default function LessonBox({ lessons }: Props) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5 my-6">
      <h3 className="font-bold text-red-800 text-lg mb-4 flex items-center gap-2">
        <span>📖</span>
        この災害が残した教訓
      </h3>
      <ul className="space-y-3">
        {lessons.map((lesson, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <p className="text-sm text-red-900 leading-relaxed">{lesson}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
