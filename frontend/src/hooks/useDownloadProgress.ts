import { useCallback, useEffect, useRef, useState } from 'react'

export type DownloadProgressState = {
  label: string
  progress: number
} | null

type ProgressCallback = (progress: number) => void

export function useDownloadProgress() {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgressState>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const runWithProgress = useCallback(async <T,>(label: string, task: (onProgress: ProgressCallback) => Promise<T>) => {
    clearTimer()
    let estimated = 8
    setDownloadProgress({ label, progress: estimated })
    timerRef.current = window.setInterval(() => {
      estimated = Math.min(88, estimated + Math.max(1, (88 - estimated) * 0.12))
      setDownloadProgress((current) => current ? { ...current, progress: Math.max(current.progress, Math.round(estimated)) } : current)
    }, 220)

    try {
      const result = await task((progress) => {
        const next = Math.min(95, Math.max(0, Math.round(progress)))
        setDownloadProgress((current) => current ? { ...current, progress: Math.max(current.progress, next) } : current)
      })
      clearTimer()
      setDownloadProgress({ label, progress: 100 })
      window.setTimeout(() => setDownloadProgress(null), 450)
      return result
    } catch (error) {
      clearTimer()
      setDownloadProgress(null)
      throw error
    }
  }, [clearTimer])

  return { downloadProgress, runWithProgress }
}
