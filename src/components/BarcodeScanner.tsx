import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'

interface Props {
  onDetected: (isbn: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
    ])
    const reader = new BrowserMultiFormatReader(hints)
    let controls: { stop: () => void } | null = null
    let stopped = false

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !stopped) {
          stopped = true
          onDetected(result.getText())
        }
      })
      .then((c) => {
        controls = c
        if (stopped) c.stop()
      })
      .catch((e) => {
        console.error(e)
        setError(
          'Kamera konnte nicht gestartet werden. Bitte Kamerazugriff erlauben.',
        )
      })

    return () => {
      stopped = true
      controls?.stop()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-semibold">📷 ISBN scannen</span>
        <button onClick={onClose} className="btn-ghost !bg-white/20 !text-white">
          Schließen
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />
        {/* Ziel-Rahmen */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-4/5 max-w-md rounded-2xl border-4 border-brand-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
        </div>
        {error && (
          <div className="absolute inset-x-0 bottom-8 mx-auto max-w-sm rounded-xl bg-red-500 p-4 text-center text-sm text-white">
            {error}
          </div>
        )}
      </div>
      <p className="p-4 text-center text-sm text-white/70">
        Halte den Barcode auf der Buchrückseite in den Rahmen.
      </p>
    </div>
  )
}
