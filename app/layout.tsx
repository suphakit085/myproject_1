// app/layout.tsx
import Navbar from '@/app/components/Navbar';
import './globals.css';

// ใช้เงื่อนไขที่ถูกต้องก่อนกำหนดค่า
// ใช้เงื่อนไขที่ถูกต้องก่อนกำหนดค่า


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}