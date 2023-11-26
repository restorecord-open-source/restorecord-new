import Document, { Html, Head, Main, NextScript } from "next/document";
import createEmotionCache from "../src/createEmotionCache";
import createEmotionServer from "@emotion/server/create-instance";

export default class MyDocument extends Document {
    render() {
        return (
            <Html style={{ scrollBehavior: "smooth" }} lang="en">
                <Head>
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:100,200,300,400,500,600,700,800,900&display=swap" />
                    <meta name="emotion-insertion-point" content="" />
                    {(this.props as any).emotionStyleTags}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}


MyDocument.getInitialProps = async (ctx: any) => {
    const originalRenderPage = ctx.renderPage;
  
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);
  
    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App: any) =>
                function EnhanceApp(props: any) {
                    return <App emotionCache={cache} {...props} />;
                },
        });
  
    const initialProps = await Document.getInitialProps(ctx);
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style: any) => (
        // eslint-disable-next-line react/no-danger
        <style data-emotion={`${style.key} ${style.ids.join(' ')}`} key={style.key} dangerouslySetInnerHTML={{ __html: style.css }} />
    ));
  
    return { 
        ...initialProps,
        emotionStyleTags,
    };
};