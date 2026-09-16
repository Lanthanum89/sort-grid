"use client";

import { useEffect, useState } from "react";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import javascript from "shiki/langs/javascript.mjs";
import python from "shiki/langs/python.mjs";
import csharp from "shiki/langs/csharp.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import type { Language } from "@/lib/code";
import { SHIKI_LANG } from "@/lib/code";

const highlighter = createHighlighterCore({
  langs: [javascript, python, csharp],
  themes: [githubLight, githubDark],
  engine: createJavaScriptRegexEngine(),
});

type Props = {
  lines: string[];
  activeLine: number;
  language: Language;
  dark: boolean;
};

export function CodePanel({ lines, activeLine, language, dark }: Props) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let live = true;
    highlighter.then((instance) => instance.codeToHtml(lines.join("\n"), {
        lang: SHIKI_LANG[language],
        theme: dark ? "github-dark" : "github-light",
        transformers: [{
          line(node, line) {
            node.properties["data-line"] = line;
            if (line === activeLine + 1) node.properties.class = "line is-active";
            else node.properties.class = "line";
          },
        }],
      })).then((result) => { if (live) setHtml(result); });
    return () => { live = false; };
  }, [activeLine, dark, language, lines]);

  if (!html) {
    return <div className="code-loading" aria-label="Loading highlighted code">Loading source…</div>;
  }

  return <div className="code-render" dangerouslySetInnerHTML={{ __html: html }} />;
}
