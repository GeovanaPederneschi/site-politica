'use client'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FigureComponent({ node, updateAttributes }: any) {
  return (
    <NodeViewWrapper as="figure" className="article-figure-node">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        draggable={false}
        style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }}
      />
      <input
        type="text"
        value={node.attrs.caption || ''}
        onChange={e => updateAttributes({ caption: e.target.value })}
        placeholder="Legenda da imagem (opcional)"
        className="figure-caption-input"
      />
    </NodeViewWrapper>
  )
}

export const FigureExtension = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      caption: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (element: HTMLElement | string) => {
          if (typeof element === 'string') return {}
          const img = element.querySelector('img')
          const figcaption = element.querySelector('figcaption')
          return {
            src: img?.getAttribute('src') ?? null,
            alt: img?.getAttribute('alt') ?? '',
            caption: figcaption?.textContent ?? '',
          }
        },
      },
    ]
  },

  renderHTML({ node }) {
    const { src, alt, caption } = node.attrs
    if (caption) {
      return [
        'figure',
        { class: 'article-figure' },
        ['img', mergeAttributes({ src, alt })],
        ['figcaption', {}, caption],
      ]
    }
    return ['figure', { class: 'article-figure' }, ['img', mergeAttributes({ src, alt })]]
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(FigureComponent as any)
  },
})
