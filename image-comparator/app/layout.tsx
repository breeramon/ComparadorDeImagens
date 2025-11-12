import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Comparador de Imagens',
    description: 'Sistema de comparação e edição de imagens com métricas de similaridade',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
        <body className={inter.className}>{children}</body>
        </html>
    );
}