// import type { Metadata } from "next";
// import { IBM_Plex_Sans } from "next/font/google";
// import localFont from "next/font/local";
// import "./globals.css";
// import { cn } from "@/lib/utils";
// import { ClerkProvider } from "@clerk/nextjs";

// // Define IBM Plex Sans font
// const IBMPlex = IBM_Plex_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-ibm-plex-sans",
// });

// // Define local fonts with variables
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// // Metadata for the Vividix app
// export const metadata: Metadata = {
//   title: "Pixelyze",
//   description: "AI-powered image generator",
// };

// // Root layout component with Clerk authentication and font styles
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body
//           className={cn(
//             "antialiased",
//             IBMPlex.variable,
//             geistSans.variable,
//             geistMono.variable
//           )}
//         >
//           <main>{children}</main>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }

import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

// Define IBM Plex Sans font
const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

// Define local fonts with variables
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata for the Vividix app
export const metadata: Metadata = {
  title: "Pixelyze",
  description: "AI-powered image generator",
};

// Root layout component with Clerk authentication and font styles
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            "antialiased",
            IBMPlex.variable,
            geistSans.variable,
            geistMono.variable
          )}
        >
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
