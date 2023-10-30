import { useState } from "react";

export default function CodeCopy({ children }: { children: any }) {
    const [copied, setCopied] = useState(false);

    return (
        <code onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1000); }} style={{ cursor: "pointer" }}>
            {copied ? "Copied!" : children}
        </code>
    )
}