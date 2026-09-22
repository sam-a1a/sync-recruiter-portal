import { useEffect, useId } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { closeHistory } from "@tiptap/pm/history";
import { Markdown } from "@tiptap/markdown";

// Match the source portal: H1/H2/H3 controls produce h2/h3/h4 under the page's h1.
const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    trailingNode: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    link: false,
  }),
  Markdown,
];

export default function RichTextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (markdown: string) => void;
}) {
  const id = useId();
  const editor = useEditor({
    extensions,
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": label,
        "aria-multiline": "true",
        "aria-required": "true",
        "aria-describedby": `${id}-hint`,
        class: "rich-text editor-content",
      },
    },
    onUpdate: ({ editor }) =>
      onChange(editor.isEmpty ? "" : editor.getMarkdown()),
  });
  const formatting = () => {
    if (!editor) return;
    // A toolbar decision is its own undo step, even when buttons are pressed quickly.
    editor.view.dispatch(closeHistory(editor.state.tr));
    return editor.chain().focus();
  };
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
      h1: editor?.isActive("heading", { level: 2 }),
      h2: editor?.isActive("heading", { level: 3 }),
      h3: editor?.isActive("heading", { level: 4 }),
      bullet: editor?.isActive("bulletList"),
      ordered: editor?.isActive("orderedList"),
      undo: editor?.can().undo(),
      redo: editor?.can().redo(),
    }),
  });
  useEffect(() => {
    if (
      editor &&
      !editor.isFocused &&
      editor.getMarkdown().trim() !== value.trim()
    ) {
      editor.commands.setContent(value, {
        contentType: "markdown",
        emitUpdate: false,
      });
    }
  }, [editor, value]);
  return (
    <div className="editor-field">
      <span className="editor-label">
        {label} <span aria-hidden="true">*</span>
      </span>
      <div className="rich-editor">
        <div
          className="editor-toolbar"
          role="toolbar"
          aria-label={`${label} formatting`}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            const buttons = [
              ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ),
            ];
            const index = buttons.indexOf(event.target as HTMLButtonElement);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? buttons.length - 1
                  : (index +
                      (event.key === "ArrowRight" ? 1 : -1) +
                      buttons.length) %
                    buttons.length;
            event.preventDefault();
            buttons[next]?.focus();
          }}
        >
          <button
            type="button"
            aria-label="Bold"
            title="Bold (⌘/Ctrl+B)"
            aria-pressed={!!state?.bold}
            onClick={() => formatting()?.toggleBold().run()}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            aria-label="Italic"
            title="Italic (⌘/Ctrl+I)"
            aria-pressed={!!state?.italic}
            onClick={() => formatting()?.toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <span className="editor-divider" />
          {([2, 3, 4] as const).map((level, i) => (
            <button
              type="button"
              key={level}
              aria-label={`Heading ${i + 1}`}
              title={`Heading ${i + 1}`}
              aria-pressed={!!state?.[(["h1", "h2", "h3"] as const)[i]]}
              onClick={() => formatting()?.toggleHeading({ level }).run()}
            >
              H<sub>{i + 1}</sub>
            </button>
          ))}
          <span className="editor-divider" />
          <button
            type="button"
            aria-label="Bulleted list"
            title="Bulleted list"
            aria-pressed={!!state?.bullet}
            onClick={() => formatting()?.toggleBulletList().run()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6h12M9 12h12M9 18h12" />
              <circle cx="4" cy="6" r="1" />
              <circle cx="4" cy="12" r="1" />
              <circle cx="4" cy="18" r="1" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Numbered list"
            title="Numbered list"
            aria-pressed={!!state?.ordered}
            onClick={() => formatting()?.toggleOrderedList().run()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 6h11M10 12h11M10 18h11M3 4h2v5M3 9h4M3 15q4-3 4 0l-4 5h4" />
            </svg>
          </button>
          <span className="editor-divider" />
          <button
            type="button"
            aria-label="Undo"
            title="Undo"
            disabled={!state?.undo}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            ↶
          </button>
          <button
            type="button"
            aria-label="Redo"
            title="Redo"
            disabled={!state?.redo}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            ↷
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <p className="meta" id={`${id}-hint`}>
        Format your description with headings, emphasis and lists. Changes are
        saved with your draft.
      </p>
    </div>
  );
}
