import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Comparador de Imagens - E02 Grupo6',
    description: 'Sistema de comparação de imagens com métricas SSIM e diferença média',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
        <body className="antialiased">{children}</body>
        </html>
    );
}