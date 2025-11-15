import jsPDF from 'jspdf';
import { CommercialProposal } from '@/lib/types/commercial-proposal';

export class ProposalPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  generate(proposal: CommercialProposal): Blob {
    this.addCover(proposal);
    this.addNewPage();
    this.addExecutiveSummary(proposal);
    this.addChallenge(proposal);
    this.addSolution(proposal);
    this.addScope(proposal);
    this.addTimeline(proposal);
    this.addInvestment(proposal);
    this.addDifferentials(proposal);
    this.addNextSteps(proposal);

    return this.doc.output('blob');
  }

  private addCover(proposal: CommercialProposal) {
    // Título
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const title = proposal.cover.proposalTitle || 'Proposta Comercial';
    this.doc.text(title, this.pageWidth / 2, 60, { align: 'center', maxWidth: this.pageWidth - 40 });

    // Informações
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.currentY = 100;

    this.addLine(`Para: ${proposal.cover.clientName}`);
    this.addLine(`A/C: ${proposal.cover.clientContact}`);
    this.addLine(`De: ${proposal.cover.ourCompany}`);
    this.addLine(`Contato: ${proposal.cover.ourContact}`);
    this.addLine(`Data: ${new Date(proposal.cover.proposalDate).toLocaleDateString('pt-BR')}`);
    this.addLine(`Validade: ${proposal.cover.validityDays} dias`);
    this.addLine(`Proposta Nº: ${proposal.proposalNumber}`);
  }

  private addExecutiveSummary(proposal: CommercialProposal) {
    if (!proposal.executiveSummary.problem) return;

    this.addSection('Sumário Executivo');
    
    if (proposal.executiveSummary.problem) {
      this.addSubSection('O Desafio');
      this.addParagraph(proposal.executiveSummary.problem);
    }

    if (proposal.executiveSummary.solution) {
      this.addSubSection('Nossa Solução');
      this.addParagraph(proposal.executiveSummary.solution);
    }

    if (proposal.executiveSummary.mainBenefit) {
      this.addSubSection('Benefício Esperado');
      this.addParagraph(proposal.executiveSummary.mainBenefit);
    }
  }

  private addChallenge(proposal: CommercialProposal) {
    if (proposal.challengeUnderstanding.currentContext.length === 0 && 
        proposal.challengeUnderstanding.businessObjectives.length === 0) return;

    this.addSection('Entendimento do Desafio');

    if (proposal.challengeUnderstanding.currentContext.length > 0) {
      this.addSubSection('Contexto Atual');
      proposal.challengeUnderstanding.currentContext.forEach(context => {
        if (context) this.addBullet(context);
      });
    }

    if (proposal.challengeUnderstanding.businessObjectives.length > 0) {
      this.addSubSection('Objetivos de Negócio');
      proposal.challengeUnderstanding.businessObjectives.forEach(obj => {
        if (obj) this.addBullet(obj);
      });
    }
  }

  private addSolution(proposal: CommercialProposal) {
    if (!proposal.proposedSolution.methodology) return;

    this.addSection('A Solução Proposta');
    this.addParagraph(proposal.proposedSolution.methodology);

    if (proposal.proposedSolution.phases.length > 0) {
      this.addSubSection('Fases do Projeto');
      proposal.proposedSolution.phases.forEach((phase, index) => {
        if (phase.title) {
          this.doc.setFont('helvetica', 'bold');
          this.addLine(`Fase ${index + 1}: ${phase.title}`);
          this.doc.setFont('helvetica', 'normal');
          if (phase.description) {
            this.addParagraph(phase.description);
          }
        }
      });
    }
  }

  private addScope(proposal: CommercialProposal) {
    if (proposal.detailedScope.includedServices.length === 0 && 
        proposal.detailedScope.excludedServices.length === 0) return;

    this.addSection('Escopo Detalhado');

    if (proposal.detailedScope.includedServices.length > 0) {
      this.addSubSection('Serviços Incluídos');
      proposal.detailedScope.includedServices.forEach(service => {
        if (service) this.addBullet(service);
      });
    }

    if (proposal.detailedScope.excludedServices.length > 0) {
      this.addSubSection('Serviços NÃO Incluídos');
      proposal.detailedScope.excludedServices.forEach(service => {
        if (service) this.addBullet(service);
      });
    }
  }

  private addTimeline(proposal: CommercialProposal) {
    if (!proposal.timeline.totalDuration) return;

    this.addSection('Cronograma');
    this.addLine(`Duração Total: ${proposal.timeline.totalDuration}`);

    if (proposal.timeline.milestones.length > 0) {
      this.addSubSection('Marcos Principais');
      proposal.timeline.milestones.forEach(milestone => {
        if (milestone.period && milestone.description) {
          this.addLine(`${milestone.period}: ${milestone.description}`);
        }
      });
    }
  }

  private addInvestment(proposal: CommercialProposal) {
    if (proposal.investment.plans.length === 0) return;

    this.addSection('Investimento');

    proposal.investment.plans.forEach(plan => {
      this.doc.setFont('helvetica', 'bold');
      this.addLine(plan.name);
      this.doc.setFontSize(16);
      const recurrence = {
        'monthly': '/ mês',
        'quarterly': '/ trimestre',
        'annual': '/ ano',
        'one-time': ''
      }[plan.recurrence];
      this.addLine(`R$ ${plan.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${recurrence}`);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      if (plan.description) {
        this.addParagraph(plan.description);
      }
      this.currentY += 5;
    });

    if (proposal.investment.paymentConditions) {
      this.addSubSection('Condições de Pagamento');
      this.addParagraph(proposal.investment.paymentConditions);
    }

    if (proposal.investment.contractTerms) {
      this.addSubSection('Condições Contratuais');
      this.addParagraph(proposal.investment.contractTerms);
    }
  }

  private addDifferentials(proposal: CommercialProposal) {
    if (!proposal.differentials.whoWeAre) return;

    this.addSection(`Por que ${proposal.cover.ourCompany}?`);
    this.addParagraph(proposal.differentials.whoWeAre);

    if (proposal.differentials.keyDifferentials.length > 0) {
      this.addSubSection('Nossos Diferenciais');
      proposal.differentials.keyDifferentials.forEach(diff => {
        if (diff) this.addBullet(diff);
      });
    }

    if (proposal.differentials.socialProof.length > 0) {
      this.addSubSection('Prova Social');
      proposal.differentials.socialProof.forEach(proof => {
        if (proof.description) {
          this.addParagraph(`"${proof.description}"`);
          if (proof.author && proof.authorRole) {
            this.doc.setFont('helvetica', 'italic');
            this.addLine(`- ${proof.author}, ${proof.authorRole}`);
            this.doc.setFont('helvetica', 'normal');
          }
        }
      });
    }
  }

  private addNextSteps(proposal: CommercialProposal) {
    if (!proposal.nextSteps.callToAction) return;

    this.addSection('Próximos Passos');
    this.addParagraph(proposal.nextSteps.callToAction);

    if (proposal.nextSteps.contactInfo) {
      this.currentY += 5;
      this.addParagraph(proposal.nextSteps.contactInfo);
    }
  }

  private addSection(title: string) {
    this.checkPageBreak(20);
    this.currentY += 10;
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
  }

  private addSubSection(title: string) {
    this.checkPageBreak(15);
    this.currentY += 5;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 7;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
  }

  private addLine(text: string) {
    this.checkPageBreak(this.lineHeight);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += this.lineHeight;
  }

  private addParagraph(text: string) {
    this.checkPageBreak(20);
    const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2));
    lines.forEach((line: string) => {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
    this.currentY += 3;
  }

  private addBullet(text: string) {
    this.checkPageBreak(this.lineHeight);
    const bulletText = `• ${text}`;
    const lines = this.doc.splitTextToSize(bulletText, this.pageWidth - (this.margin * 2) - 5);
    lines.forEach((line: string, index: number) => {
      this.checkPageBreak(this.lineHeight);
      const x = index === 0 ? this.margin : this.margin + 5;
      this.doc.text(line, x, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  private addNewPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  downloadPDF(proposal: CommercialProposal, filename?: string) {
    const blob = this.generate(proposal);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `proposta-${proposal.proposalNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openPDFInNewTab(proposal: CommercialProposal) {
    const blob = this.generate(proposal);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
