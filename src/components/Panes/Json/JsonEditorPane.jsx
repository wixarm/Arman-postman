import React, { useRef, useEffect } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { defaultTabBinding } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";

const basicExtensions = [
  basicSetup,
  keymap.of([defaultTabBinding]),
  json(),
  EditorState.tabSize.of(2),
];

export default function JsonEditorPanel({
  paneValue,
  setPaneValue,
  isEditable = true,
}) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: paneValue,
      extensions: [
        ...basicExtensions,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setPaneValue(update.state.doc.toString());
          }
        }),
        EditorView.editable.of(isEditable),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      const currentDoc = view.state.doc.toString();
      if (paneValue !== currentDoc) {
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: paneValue },
        });
      }
    }
  }, [paneValue]);

  return <div ref={editorRef}></div>;
}
