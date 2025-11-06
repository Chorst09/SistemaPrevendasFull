'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Edital } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    FileText,
    Brain,
    CheckCircle,
    AlertCircle,
    Download,
    Loader2,
    Eye,
    Search,
    Calendar,
    DollarSign,
    Users,
    Clock,
    Shield,
    Award
} from 'lucide-react';

interface DocumentAnalysis {
    type: string;
    required: boolean;
    found: boolean;
    description: string;
    observations?: string;
}

interface ProductAnalysis {
    item: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedValue?: number;
    technicalRequirements: string[];
    compliance: 'compliant' | 'partial' | 'non-compliant';
    observations: string;
}

interface BidAnalysisResult {
    summary: {
        bidNumber: string;
        title: string;
        publishingBody: string;
        openingDate: string;
        estimatedValue: number;
        participationDeadline: string;
        modality: string;
    };
    documents: DocumentAnalysis[];
    products: ProductAnalysis[];
    requirements: {
        technical: string[];
        legal: string[];
        financial: string[];
    };
    risks: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
    };
    recommendations: string[];
    complianceScore: number;
}

interface AIBidAnalyzerProps {
    onSaveEdital?: (edital: any) => void;
    onNavigateToAnalyzed?: () => void;
}

const AIBidAnalyzer: React.FC<AIBidAnalyzerProps> = ({ onSaveEdital, onNavigateToAnalyzed }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<BidAnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [isExporting, setIsExporting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('AIBidAnalyzer montado, onSaveEdital disponível:', !!onSaveEdital);
    }, [onSaveEdital]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const simulateAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        // Simular progresso da análise
        const steps = [
            { progress: 20, message: 'Extraindo texto dos documentos...' },
            { progress: 40, message: 'Analisando estrutura do edital...' },
            { progress: 60, message: 'Identificando produtos e serviços...' },
            { progress: 80, message: 'Verificando documentos obrigatórios...' },
            { progress: 100, message: 'Finalizando análise...' }
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setAnalysisProgress(step.progress);
        }

        // Resultado simulado da análise
        const mockResult: BidAnalysisResult = {
            summary: {
                bidNumber: 'PE-001/2024',
                title: 'Contratação de Serviços de TI e Infraestrutura',
                publishingBody: 'Ministério da Educação - MEC',
                openingDate: '2024-12-15',
                estimatedValue: 2500000,
                participationDeadline: '2024-12-10',
                modality: 'Pregão Eletrônico'
            },
            documents: [
                {
                    type: 'Declaração de Habilitação',
                    required: true,
                    found: true,
                    description: 'Declaração conforme modelo do anexo III'
                },
                {
                    type: 'Certidão Negativa Federal',
                    required: true,
                    found: false,
                    description: 'Certidão conjunta da RFB e PGFN',
                    observations: 'Documento não encontrado - OBRIGATÓRIO'
                },
                {
                    type: 'Balanço Patrimonial',
                    required: true,
                    found: true,
                    description: 'Últimos 3 exercícios sociais'
                },
                {
                    type: 'Atestado de Capacidade Técnica',
                    required: true,
                    found: true,
                    description: 'Comprovação de experiência em serviços similares'
                }
            ],
            products: [
                {
                    item: 'Item 1',
                    description: 'Serviços de Suporte Técnico Especializado',
                    quantity: 12,
                    unit: 'meses',
                    estimatedValue: 120000,
                    technicalRequirements: [
                        'Certificação Microsoft Azure',
                        'Experiência mínima de 5 anos',
                        'Disponibilidade 24x7'
                    ],
                    compliance: 'compliant',
                    observations: 'Requisitos atendidos pela equipe atual'
                },
                {
                    item: 'Item 2',
                    description: 'Licenças de Software Microsoft 365',
                    quantity: 500,
                    unit: 'licenças',
                    estimatedValue: 800000,
                    technicalRequirements: [
                        'Licenças E3 ou superior',
                        'Suporte técnico incluído',
                        'Migração de dados'
                    ],
                    compliance: 'partial',
                    observations: 'Necessário verificar disponibilidade de licenças E5'
                }
            ],
            requirements: {
                technical: [
                    'Certificações Microsoft obrigatórias',
                    'Equipe técnica com experiência comprovada',
                    'Infraestrutura de backup e segurança'
                ],
                legal: [
                    'Registro no CREA/CRC conforme aplicável',
                    'Certidões negativas atualizadas',
                    'Declaração de inexistência de fato impeditivo'
                ],
                financial: [
                    'Capital social mínimo de R$ 500.000',
                    'Patrimônio líquido positivo',
                    'Índices de liquidez adequados'
                ]
            },
            risks: {
                level: 'medium',
                factors: [
                    'Prazo apertado para entrega da documentação',
                    'Exigência de certificações específicas',
                    'Valor estimado elevado pode limitar concorrência'
                ]
            },
            recommendations: [
                'Providenciar certidão negativa federal urgentemente',
                'Verificar disponibilidade de licenças Microsoft E5',
                'Preparar documentação técnica com antecedência',
                'Considerar parcerias para atender todos os requisitos'
            ],
            complianceScore: 75
        };

        setAnalysisResult(mockResult);
        setIsAnalyzing(false);
        setActiveTab('results');
    };

    const getComplianceColor = (compliance: string) => {
        switch (compliance) {
            case 'compliant': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            case 'non-compliant': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const exportToPDF = async () => {
        if (!analysisResult) return;

        setIsExporting(true);

        try {
            // Configurações do PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;

            // Título do relatório
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Relatório de Análise de Edital', margin, 30);

            // Data de geração
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 40);

            let yPosition = 50;

            // Resumo do Edital
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Resumo do Edital', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Número: ${analysisResult.summary.bidNumber}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Órgão: ${analysisResult.summary.publishingBody}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Modalidade: ${analysisResult.summary.modality}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Valor Estimado: R$ ${analysisResult.summary.estimatedValue.toLocaleString('pt-BR')}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Abertura: ${analysisResult.summary.openingDate}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Prazo: ${analysisResult.summary.participationDeadline}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Score de Conformidade: ${analysisResult.complianceScore}%`, margin, yPosition);
            yPosition += 15;

            // Título do edital (quebra de linha se necessário)
            pdf.setFont('helvetica', 'bold');
            pdf.text('Título:', margin, yPosition);
            yPosition += 5;
            pdf.setFont('helvetica', 'normal');
            const titleLines = pdf.splitTextToSize(analysisResult.summary.title, pageWidth - 2 * margin);
            pdf.text(titleLines, margin, yPosition);
            yPosition += titleLines.length * 5 + 10;

            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 30;
            }

            // Documentos Obrigatórios
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Documentos Obrigatórios', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            analysisResult.documents.forEach((doc) => {
                if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = 30;
                }

                const status = doc.found ? '✓' : '✗';
                const statusColor: [number, number, number] = doc.found ? [0, 128, 0] : [255, 0, 0];

                pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                pdf.text(status, margin, yPosition);
                pdf.setTextColor(0, 0, 0);
                pdf.setFont('helvetica', 'bold');
                pdf.text(doc.type, margin + 10, yPosition);
                yPosition += 5;

                pdf.setFont('helvetica', 'normal');
                const descLines = pdf.splitTextToSize(doc.description, pageWidth - 2 * margin - 10);
                pdf.text(descLines, margin + 10, yPosition);
                yPosition += descLines.length * 5;

                if (doc.observations) {
                    pdf.setTextColor(255, 0, 0);
                    const obsLines = pdf.splitTextToSize(doc.observations, pageWidth - 2 * margin - 10);
                    pdf.text(obsLines, margin + 10, yPosition);
                    pdf.setTextColor(0, 0, 0);
                    yPosition += obsLines.length * 5;
                }
                yPosition += 5;
            });

            yPosition += 10;

            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 30;
            }

            // Produtos e Serviços
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Produtos e Serviços', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            analysisResult.products.forEach((product, index) => {
                if (yPosition > pageHeight - 60) {
                    pdf.addPage();
                    yPosition = 30;
                }

                pdf.setFont('helvetica', 'bold');
                pdf.text(`${product.item}: ${product.description}`, margin, yPosition);
                yPosition += 5;

                pdf.setFont('helvetica', 'normal');
                pdf.text(`Quantidade: ${product.quantity} ${product.unit}`, margin, yPosition);
                yPosition += 5;

                if (product.estimatedValue) {
                    pdf.text(`Valor Estimado: R$ ${product.estimatedValue.toLocaleString('pt-BR')}`, margin, yPosition);
                    yPosition += 5;
                }

                const complianceText = product.compliance === 'compliant' ? 'Conforme' :
                    product.compliance === 'partial' ? 'Parcial' : 'Não Conforme';
                pdf.text(`Conformidade: ${complianceText}`, margin, yPosition);
                yPosition += 5;

                pdf.text('Requisitos Técnicos:', margin, yPosition);
                yPosition += 5;
                product.technicalRequirements.forEach((req) => {
                    const reqLines = pdf.splitTextToSize(`• ${req}`, pageWidth - 2 * margin - 10);
                    pdf.text(reqLines, margin + 5, yPosition);
                    yPosition += reqLines.length * 5;
                });

                pdf.text('Observações:', margin, yPosition);
                yPosition += 5;
                const obsLines = pdf.splitTextToSize(product.observations, pageWidth - 2 * margin - 5);
                pdf.text(obsLines, margin + 5, yPosition);
                yPosition += obsLines.length * 5 + 10;
            });

            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 30;
            }

            // Análise de Riscos
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Análise de Riscos', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const riskLevel = analysisResult.risks.level === 'low' ? 'Baixo' :
                analysisResult.risks.level === 'medium' ? 'Médio' : 'Alto';
            pdf.text(`Nível de Risco: ${riskLevel}`, margin, yPosition);
            yPosition += 10;

            pdf.text('Fatores de Risco:', margin, yPosition);
            yPosition += 5;
            analysisResult.risks.factors.forEach((factor) => {
                const factorLines = pdf.splitTextToSize(`• ${factor}`, pageWidth - 2 * margin - 10);
                pdf.text(factorLines, margin + 5, yPosition);
                yPosition += factorLines.length * 5;
            });

            yPosition += 10;

            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 30;
            }

            // Recomendações
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Recomendações da IA', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            analysisResult.recommendations.forEach((recommendation) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 30;
                }
                const recLines = pdf.splitTextToSize(`• ${recommendation}`, pageWidth - 2 * margin - 10);
                pdf.text(recLines, margin + 5, yPosition);
                yPosition += recLines.length * 5 + 3;
            });

            // Salvar o PDF
            const fileName = `analise-edital-${analysisResult.summary.bidNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o relatório PDF. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportScreenshotToPDF = async () => {
        if (!analysisResult || !reportRef.current) return;

        setIsExporting(true);

        try {
            // Capturar screenshot da interface
            const canvas = await html2canvas(reportRef.current, {
                useCORS: true,
                allowTaint: true,
                background: '#ffffff',
                width: reportRef.current.scrollWidth,
                height: reportRef.current.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pageWidth - 20; // margem de 10mm de cada lado
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10; // margem superior

            // Adicionar título
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Relatório de Análise de Edital', 10, position);
            position += 10;

            // Adicionar primeira parte da imagem
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight - position;

            // Adicionar páginas adicionais se necessário
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `analise-edital-screenshot-${analysisResult.summary.bidNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Erro ao gerar PDF com screenshot:', error);
            alert('Erro ao gerar o relatório PDF com screenshot. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    const saveEditalToAnalyzed = () => {
        if (!analysisResult || !onSaveEdital) {
            console.log('Erro ao salvar:', { analysisResult: !!analysisResult, onSaveEdital: !!onSaveEdital });
            return;
        }

        console.log('Salvando edital...', analysisResult.summary.title);

        const editalData = {
            title: analysisResult.summary.title,
            publicationNumber: analysisResult.summary.bidNumber,
            publishingBody: analysisResult.summary.publishingBody,
            publishDate: new Date().toISOString().split('T')[0],
            openingDate: analysisResult.summary.openingDate,
            submissionDeadline: analysisResult.summary.participationDeadline,
            category: 'TI', // Pode ser inferido dos produtos
            estimatedValue: analysisResult.summary.estimatedValue,
            status: 'Em Análise' as const,
            description: `Edital analisado via IA - ${analysisResult.summary.modality}`,
            requirements: analysisResult.requirements.technical.concat(analysisResult.requirements.legal, analysisResult.requirements.financial).join('; '),
            documents: analysisResult.documents.map((doc, index) => ({
                id: `DOC-${Date.now()}-${index}`,
                name: doc.type,
                type: doc.required ? 'Obrigatório' : 'Opcional',
                description: doc.description,
                status: doc.found ? 'Pronto' : 'Pendente',
                notes: doc.observations || ''
            })),
            products: analysisResult.products.map((product, index) => ({
                id: `PROD-${Date.now()}-${index}`,
                description: `${product.item}: ${product.description}`,
                quantity: product.quantity,
                unit: product.unit,
                estimatedUnitPrice: product.estimatedValue ? product.estimatedValue / product.quantity : 0,
                totalEstimatedPrice: product.estimatedValue || 0,
                specifications: product.technicalRequirements.join('; '),
                status: product.compliance === 'compliant' ? 'Disponível' :
                    product.compliance === 'partial' ? 'Em Cotação' : 'Indisponível'
            })),
            analysis: {
                id: `ANL-${Date.now()}`,
                editalId: `EDT-${Date.now()}`,
                analysisDate: new Date().toISOString().split('T')[0],
                analyst: 'IA Assistant',
                documentAnalysis: {
                    totalDocuments: analysisResult.documents.length,
                    readyDocuments: analysisResult.documents.filter(doc => doc.found).length,
                    pendingDocuments: analysisResult.documents.filter(doc => !doc.found).length,
                    criticalDocuments: analysisResult.documents.filter(doc => !doc.found && doc.required).map(doc => doc.type),
                    notes: 'Análise automática de documentos via IA'
                },
                productAnalysis: {
                    totalProducts: analysisResult.products.length,
                    availableProducts: analysisResult.products.filter(p => p.compliance === 'compliant').length,
                    unavailableProducts: analysisResult.products.filter(p => p.compliance === 'non-compliant').length,
                    totalEstimatedValue: analysisResult.summary.estimatedValue,
                    competitiveAdvantage: analysisResult.complianceScore >= 70 ? 'Alta conformidade técnica' : 'Necessita ajustes',
                    notes: 'Análise de produtos baseada em IA'
                },
                timelineAnalysis: {
                    daysUntilOpening: Math.ceil((new Date(analysisResult.summary.openingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                    daysUntilDeadline: Math.ceil((new Date(analysisResult.summary.participationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                    isUrgent: Math.ceil((new Date(analysisResult.summary.participationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7,
                    timelineRisk: analysisResult.risks.level as any,
                    notes: 'Análise de cronograma via IA'
                },
                publishingBodyAnalysis: {
                    bodyType: 'Federal' as any,
                    paymentHistory: 'Bom' as any,
                    previousExperience: 'Órgão analisado via IA',
                    notes: 'Análise automática baseada em inteligência artificial'
                },
                overallAssessment: {
                    score: analysisResult.complianceScore,
                    recommendation: analysisResult.complianceScore >= 70 ? 'Participar' as any : 'Avaliar Riscos' as any,
                    strengths: analysisResult.products.filter(p => p.compliance === 'compliant').map(p => p.item),
                    weaknesses: analysisResult.products.filter(p => p.compliance !== 'compliant').map(p => p.item),
                    opportunities: analysisResult.recommendations.slice(0, 2),
                    threats: analysisResult.risks.factors,
                    finalNotes: analysisResult.recommendations.join('\n')
                }
            }
        };

        console.log('Dados do edital a serem salvos:', editalData);
        onSaveEdital(editalData);
        setIsSaved(true);
        console.log('Edital salvo com sucesso!');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Analisador de Editais com IA
                </h1>
                <p className="text-gray-600">
                    Análise inteligente de editais, documentos obrigatórios e produtos do termo de referência
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload de Documentos</TabsTrigger>
                    <TabsTrigger value="analysis" disabled={files.length === 0}>
                        Análise
                    </TabsTrigger>
                    <TabsTrigger value="results" disabled={!analysisResult}>
                        Resultados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload de Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        Clique para fazer upload dos documentos
                                    </p>
                                    <p className="text-gray-500">
                                        Suporte para PDF, DOC, DOCX (máx. 10MB cada)
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>

                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-gray-900">Arquivos Selecionados:</h3>
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm font-medium">{file.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {files.length > 0 && (
                                    <Button
                                        onClick={() => setActiveTab('analysis')}
                                        className="w-full"
                                    >
                                        Prosseguir para Análise
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Análise com IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!isAnalyzing ? (
                                <div className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            A IA irá analisar os documentos enviados e extrair informações sobre:
                                            documentos obrigatórios, produtos/serviços, requisitos técnicos e riscos.
                                        </AlertDescription>
                                    </Alert>

                                    <Button onClick={simulateAnalysis} className="w-full" size="lg">
                                        <Brain className="h-4 w-4 mr-2" />
                                        Iniciar Análise com IA
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                        <p className="text-lg font-medium">Analisando documentos...</p>
                                    </div>

                                    <Progress value={analysisProgress} className="w-full" />

                                    <p className="text-center text-gray-600">
                                        {analysisProgress}% concluído
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results" className="space-y-6">
                    {analysisResult && (
                        <div ref={reportRef}>
                            {/* Resumo do Edital */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Resumo do Edital
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Número do Edital</p>
                                            <p className="text-lg font-semibold">{analysisResult.summary.bidNumber}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Órgão</p>
                                            <p className="text-lg font-semibold">{analysisResult.summary.publishingBody}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Modalidade</p>
                                            <p className="text-lg font-semibold">{analysisResult.summary.modality}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Valor Estimado</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                R$ {analysisResult.summary.estimatedValue.toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Abertura</p>
                                            <p className="text-lg font-semibold">{analysisResult.summary.openingDate}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Prazo para Participação</p>
                                            <p className="text-lg font-semibold text-orange-600">{analysisResult.summary.participationDeadline}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">Score de Conformidade</p>
                                            <div className="flex items-center gap-2">
                                                <Progress value={analysisResult.complianceScore} className="flex-1" />
                                                <span className="text-lg font-semibold">{analysisResult.complianceScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-500 mb-2">Título</p>
                                        <p className="text-base">{analysisResult.summary.title}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documentos Obrigatórios */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Documentos Obrigatórios
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysisResult.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{doc.type}</h4>
                                                        {doc.found ? (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{doc.description}</p>
                                                    {doc.observations && (
                                                        <p className="text-sm text-red-600 mt-1">{doc.observations}</p>
                                                    )}
                                                </div>
                                                <Badge variant={doc.found ? "default" : "destructive"}>
                                                    {doc.found ? "Encontrado" : "Pendente"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Produtos e Serviços */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Produtos e Serviços
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analysisResult.products.map((product, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{product.item}</h4>
                                                        <p className="text-gray-600">{product.description}</p>
                                                    </div>
                                                    <Badge className={getComplianceColor(product.compliance)}>
                                                        {product.compliance === 'compliant' ? 'Conforme' :
                                                            product.compliance === 'partial' ? 'Parcial' : 'Não Conforme'}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Quantidade</p>
                                                        <p className="text-base">{product.quantity} {product.unit}</p>
                                                    </div>
                                                    {product.estimatedValue && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Valor Estimado</p>
                                                            <p className="text-base font-semibold text-green-600">
                                                                R$ {product.estimatedValue.toLocaleString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-gray-500 mb-2">Requisitos Técnicos</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {product.technicalRequirements.map((req, reqIndex) => (
                                                            <li key={reqIndex} className="text-sm text-gray-700">{req}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 mb-1">Observações</p>
                                                    <p className="text-sm text-gray-700">{product.observations}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Requisitos e Riscos */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5" />
                                            Requisitos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="technical" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="technical">Técnicos</TabsTrigger>
                                                <TabsTrigger value="legal">Legais</TabsTrigger>
                                                <TabsTrigger value="financial">Financeiros</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="technical" className="space-y-2">
                                                {analysisResult.requirements.technical.map((req, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm">{req}</p>
                                                    </div>
                                                ))}
                                            </TabsContent>
                                            <TabsContent value="legal" className="space-y-2">
                                                {analysisResult.requirements.legal.map((req, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm">{req}</p>
                                                    </div>
                                                ))}
                                            </TabsContent>
                                            <TabsContent value="financial" className="space-y-2">
                                                {analysisResult.requirements.financial.map((req, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm">{req}</p>
                                                    </div>
                                                ))}
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Análise de Riscos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-2">Nível de Risco</p>
                                                <Badge className={`${getRiskColor(analysisResult.risks.level)} text-lg px-3 py-1`}>
                                                    {analysisResult.risks.level === 'low' ? 'Baixo' :
                                                        analysisResult.risks.level === 'medium' ? 'Médio' : 'Alto'}
                                                </Badge>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-2">Fatores de Risco</p>
                                                <div className="space-y-2">
                                                    {analysisResult.risks.factors.map((factor, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                            <p className="text-sm">{factor}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recomendações */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        Recomendações da IA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysisResult.recommendations.map((recommendation, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                                <Brain className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-blue-900">{recommendation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notificação de Sucesso */}
                            {isSaved && (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <strong>Edital salvo com sucesso!</strong> Você pode visualizá-lo na seção "Editais Analisados".
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Ações */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <Button
                                                className="flex-1"
                                                onClick={exportToPDF}
                                                disabled={isExporting}
                                            >
                                                {isExporting ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4 mr-2" />
                                                )}
                                                {isExporting ? 'Gerando PDF...' : 'Exportar Relatório PDF'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={exportScreenshotToPDF}
                                                disabled={isExporting}
                                            >
                                                {isExporting ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Eye className="h-4 w-4 mr-2" />
                                                )}
                                                {isExporting ? 'Gerando PDF...' : 'PDF com Screenshot'}
                                            </Button>
                                        </div>
                                        <div className="flex gap-4">
                                            {onSaveEdital && (
                                                <Button
                                                    variant={isSaved ? "secondary" : "default"}
                                                    onClick={saveEditalToAnalyzed}
                                                    disabled={isSaved}
                                                    className="flex-1"
                                                >
                                                    {isSaved ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Salvo em Editais Analisados
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Award className="h-4 w-4 mr-2" />
                                                            Salvar em Editais Analisados
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            {isSaved && onNavigateToAnalyzed && (
                                                <Button
                                                    variant="outline"
                                                    onClick={onNavigateToAnalyzed}
                                                    className="flex-1"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver em Editais Analisados
                                                </Button>
                                            )}
                                            <Button variant="outline" onClick={() => {
                                                setFiles([]);
                                                setAnalysisResult(null);
                                                setIsSaved(false);
                                                setActiveTab('upload');
                                            }}>
                                                Nova Análise
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AIBidAnalyzer;