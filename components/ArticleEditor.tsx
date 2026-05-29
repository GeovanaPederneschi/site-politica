'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { FigureExtension } from './FigureExtension'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered,
  Quote, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Heading2, Heading3, Undo, Redo, ImageIcon, Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ArticleEditorProps {
  content: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
}

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded text-sm transition-colors disabled:opacity-40 ${
        active ? 'bg-ink text-paper' : 'text-ink-light hover:bg-paper-warm'
      }`}
    >
      {children}
    </button>
  )
}

export default function ArticleEditor({ content, onChange, onUploadImage }: ArticleEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ blockquote: { HTMLAttributes: { class: 'editorial-quote' } } }),
      Image,
      FigureExtension,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escreva o corpo do artigo aqui...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'article-body focus:outline-none min-h-[400px] p-4' },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  function setLink() {
    const url = window.prompt('URL do link:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onUploadImage) return
    setUploading(true)
    try {
      const url = await onUploadImage(file)
      editor?.chain().focus().insertContent({
        type: 'figure',
        attrs: { src: url, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' },
      }).run()
    } catch {
      window.alert('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="border border-border rounded overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-paper-warm">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo size={15} /></ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título H2"><Heading2 size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título H3"><Heading3 size={15} /></ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito"><Bold size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico"><Italic size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado"><UnderlineIcon size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado"><Strikethrough size={15} /></ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar à esquerda"><AlignLeft size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar"><AlignCenter size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar à direita"><AlignRight size={15} /></ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista"><List size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada"><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação"><Quote size={15} /></ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link"><LinkIcon size={15} /></ToolbarButton>
        {onUploadImage && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <ToolbarButton
              onClick={() => imageInputRef.current?.click()}
              title="Inserir imagem com legenda"
              disabled={uploading}
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
            </ToolbarButton>
          </>
        )}
      </div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <EditorContent editor={editor} />
    </div>
  )
}
