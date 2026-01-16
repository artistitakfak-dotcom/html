import "./globals.css";

export const metadata = {
  title: "HTML Editor",
  description: "Real-time WYSIWYG HTML editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
