export default function ScreenshotOrPlaceholder({ base64, alt = 'Screenshot' }: { base64?: string; alt?: string }) {
  if (base64 && base64.trim()) {
    const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="rounded-md border border-gray-200 w-full block mt-3" />
    )
  }
  return (
    <div className="mt-3 rounded-md border-2 border-dashed border-gray-200 h-24 flex items-center justify-center">
      <span className="text-xs text-gray-400">No screenshot captured</span>
    </div>
  )
}
