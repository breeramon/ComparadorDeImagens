import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ImagePro - Sistema Profissional de Comparação de Imagens',
    description: 'Compare e edite imagens com métricas avançadas SSIM e diferença média',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
        <body>
        <div className="app-container">
            {children}
        </div>
        </body>
        </html>
    );
}