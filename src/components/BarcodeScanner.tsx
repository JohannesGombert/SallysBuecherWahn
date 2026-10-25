import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'
import { Corners } from './Emblem'
import { Sigil } from './Sigil'

interface Props {
  onDetected: (isbn: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A])
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
        setError('Kamera konnte nicht gestartet werden. Bitte Kamerazugriff erlauben.')
      })

    return () => {
      stopped = true
      controls?.stop()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night-950" role="dialog" aria-modal="true" aria-label="ISBN scannen">
      <div className="flex items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="rubric flex items-center gap-2">
          <Sigil name="camera" className="h-4 w-4" /> ISBN scannen
        </span>
        <button onClick={onClose} className="btn-icon" aria-label="Schließen">
          <Sigil name="close" />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-40 w-4/5 max-w-md rounded-xl border border-gold-300/80 shadow-[0_0_0_9999px_rgba(6,9,22,0.6),0_0_30px_rgba(240,217,154,0.4)]">
            <Corners inset="-inset-2" size="h-8 w-8" />
          </div>
        </div>
        {error && (
          <p className="absolute inset-x-4 bottom-8 mx-auto max-w-sm rounded-xl border border-danger/50 bg-night-900/95 p-4 text-center text-danger">
            {error}
          </p>
        )}
      </div>
      <p className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-center italic text-ivory-200">
        Halte den Barcode auf der Buchrückseite in den goldenen Rahmen.
      </p>
    </div>
  )
}
