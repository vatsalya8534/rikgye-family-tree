"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import type { Editor as TinyMCEEditor } from "tinymce";

export default function TinyEditor() {

  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <Editor
      apiKey="9b9wji2lpvz93l03y7ai6kb09gpxzcpsnrxemixdpbpsuq8l"
      onInit={(evt: any, editor: TinyMCEEditor) => {
        editorRef.current = editor;
      }}
    //   initialValue="<p>Start writing...</p>"
      init={{
        height: 400,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "preview",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "table",
        ],
        toolbar:
          "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code fullscreen",
      }}
    />
  );
}