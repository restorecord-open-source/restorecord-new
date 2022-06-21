import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html className="scroll-smooth">
            <Head />
            <body className="antialiased bg-slate-900">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}