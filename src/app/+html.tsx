import { ScrollViewStyleReset } from "expo-router/html";
import { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#176B47" />
        <meta
          name="description"
          content="FauxGo is a polished entertainment simulation of modern on-demand journeys. Nothing real is ordered, booked, or charged."
        />
        <meta name="application-name" content="FauxGo" />
        <meta name="apple-mobile-web-app-title" content="FauxGo" />
        <meta name="robots" content="index,follow" />
        <title>FauxGo — all the journey, none of the going</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
