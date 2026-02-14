'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Mic,
  MicOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotesEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

// Speech Recognition types
interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function NotesEditor({
  value,
  onChange,
  placeholder = 'Add notes...',
  disabled = false,
  maxLength = 2000,
}: NotesEditorProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [charCount, setCharCount] = useState(value.length)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  // Voice-to-text functionality
  const startVoiceRecording = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert('Voice recognition is not supported in your browser.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      // Append to existing text
      const currentText = textareaRef.current?.value || ''
      const newText = currentText + (currentText ? ' ' : '') + transcript

      if (newText.length <= maxLength) {
        onChange(newText)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  // Text formatting functions
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current || disabled) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end)

    if (newText.length <= maxLength) {
      onChange(newText)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, end + prefix.length)
      }, 0)
    }
  }

  const insertList = (ordered: boolean) => {
    if (!textareaRef.current || disabled) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const lines = selectedText.split('\n')
    const formattedLines = lines.map((line, index) => {
      if (line.trim()) {
        return (ordered ? `${index + 1}. ` : '- ') + line.trim()
      }
      return line
    })

    const newText =
      value.substring(0, start) +
      formattedLines.join('\n') +
      value.substring(end)

    if (newText.length <= maxLength) {
      onChange(newText)
    }
  }

  const insertLink = () => {
    if (!textareaRef.current || disabled) return

    const url = prompt('Enter URL:')
    if (!url) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || 'Link'

    const linkText = `[${selectedText}](${url})`
    const newText = value.substring(0, start) + linkText + value.substring(end)

    if (newText.length <= maxLength) {
      onChange(newText)
    }
  }

  return (
    <div className='space-y-2'>
      {/* Toolbar */}
      <div className='flex items-center gap-1 p-1 bg-slate-50 rounded-t-lg border border-b-0'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => insertFormatting('**')}
          disabled={disabled}
          title='Bold'>
          <Bold className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => insertFormatting('*')}
          disabled={disabled}
          title='Italic'>
          <Italic className='w-4 h-4' />
        </Button>
        <div className='w-px h-5 bg-slate-200 mx-1' />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => insertList(false)}
          disabled={disabled}
          title='Bullet List'>
          <List className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => insertList(true)}
          disabled={disabled}
          title='Numbered List'>
          <ListOrdered className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={insertLink}
          disabled={disabled}
          title='Insert Link'>
          <Link2 className='w-4 h-4' />
        </Button>
        <div className='w-px h-5 bg-slate-200 mx-1' />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={disabled}
          title={isRecording ? 'Stop Recording' : 'Voice to Text'}
          className={isRecording ? 'text-red-500 hover:text-red-600' : ''}>
          {isRecording ? (
            <MicOff className='w-4 h-4' />
          ) : (
            <Mic className='w-4 h-4' />
          )}
        </Button>
      </div>

      {/* Textarea */}
      <div className='relative'>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange(e.target.value)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full min-h-[100px] p-3 border rounded-b-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-slate-50 text-slate-500' : 'bg-white'
          } ${isRecording ? 'ring-2 ring-red-300' : ''}`}
          rows={4}
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className='absolute top-2 right-2 flex items-center gap-1 text-red-500 text-sm'>
            <span className='animate-pulse'>●</span>
            Recording...
          </div>
        )}
      </div>

      {/* Character count */}
      <div className='flex justify-between text-xs text-slate-500'>
        <span>Supports: **bold**, *italic*, - lists, [links](url)</span>
        <span className={charCount > maxLength * 0.9 ? 'text-amber-500' : ''}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  )
}
