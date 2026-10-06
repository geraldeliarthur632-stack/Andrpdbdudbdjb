import { jsPDF } from 'jspdf';
import { UserProfile, GradeLevel } from '../types';
import { GRADE_LABELS } from '../data/curriculumData';
import { TopicSummaryItem } from '../data/subjectSummariesData';

export class SubjectPdfService {
  /**
   * Generates a downloadable multi-page .PDF file using jsPDF
   */
  public static async generateAndDownloadPdf(
    topics: TopicSummaryItem[],
    user: UserProfile,
    filterSubjectName?: string
  ): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const gradeInfo = GRADE_LABELS[user.grade || '6_fund']?.full || 'Ensino Fundamental';
    const currentDate = new Date().toLocaleDateString('pt-BR');

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        drawHeaderMini();
      }
    };

    const drawHeaderMini = () => {
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 150);
      doc.setFont('helvetica', 'normal');
      doc.text('Trilha do Saber • Resumo Completo de Estudos', margin, y);
      doc.text(`${user.name || 'Estudante'} • ${gradeInfo}`, pageWidth - margin, y, { align: 'right' });
      y += 4;
      doc.setDrawColor(220, 225, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    };

    // ==========================================
    // COVER / MAIN HEADER
    // ==========================================
    // Top banner background
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

    // Title text inside banner
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TRILHA DO SABER • RESUMO DAS MATÉRIAS', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // Slate-300
    doc.text(
      `Aluno(a): ${user.name || 'Estudante'} | Série: ${gradeInfo} | Data: ${currentDate}`,
      margin + 6,
      y + 15
    );
    doc.text(
      `Conteúdo: ${filterSubjectName || 'Todas as Matérias da Série'} (${topics.length} tópicos)`,
      margin + 6,
      y + 21
    );

    y += 32;

    // ==========================================
    // LOOP OVER EACH TOPIC
    // ==========================================
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];

      // Ensure space for topic header
      checkPageBreak(35);

      // Subject Badge & Topic Title Banner
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text(`[${topic.subjectName.toUpperCase()}]`, margin + 4, y + 8);

      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFontSize(11);
      doc.text(topic.title, margin + 40, y + 8);

      y += 16;

      // 1. COMO SE FAZ / EXPLICAÇÃO PASSO A PASSO
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 58, 138); // Blue-900
      doc.text('📘 COMO SE FAZ (EXPLICAÇÃO E TEORIA):', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // Slate-700
      const howItWorksLines = doc.splitTextToSize(topic.howItWorks, contentWidth);
      checkPageBreak(howItWorksLines.length * 4);
      doc.text(howItWorksLines, margin, y);
      y += howItWorksLines.length * 4 + 3;

      // Key Steps
      if (topic.keySteps && topic.keySteps.length > 0) {
        checkPageBreak(topic.keySteps.length * 4.5);
        for (const step of topic.keySteps) {
          const stepLines = doc.splitTextToSize(step, contentWidth - 4);
          checkPageBreak(stepLines.length * 4);
          doc.text(stepLines, margin + 2, y);
          y += stepLines.length * 4 + 1.5;
        }
        y += 2;
      }

      // 2. REGRAS & FÓRMULAS IMPORTANTES
      if (topic.rulesAndFormulas && topic.rulesAndFormulas.length > 0) {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(146, 64, 14); // Amber-800
        doc.text('📐 REGRAS, FÓRMULAS & PROPRIEDADES:', margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        for (const rule of topic.rulesAndFormulas) {
          const ruleLines = doc.splitTextToSize(`• ${rule}`, contentWidth - 4);
          checkPageBreak(ruleLines.length * 4);
          doc.text(ruleLines, margin + 2, y);
          y += ruleLines.length * 4 + 1.5;
        }
        y += 2;
      }

      // 3. EXEMPLOS RESOLVIDOS PASSO A PASSO
      if (topic.examples && topic.examples.length > 0) {
        checkPageBreak(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(22, 101, 52); // Emerald-800
        doc.text('📝 EXEMPLOS PRÁTICOS RESOLVIDOS:', margin, y);
        y += 5;

        for (let exIdx = 0; exIdx < topic.examples.length; exIdx++) {
          const ex = topic.examples[exIdx];
          checkPageBreak(25);

          // Example Box Background
          doc.setFillColor(248, 250, 252); // Slate-50
          doc.setDrawColor(226, 232, 240);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`▶ ${ex.title || `Exemplo ${exIdx + 1}`}:`, margin + 2, y);
          y += 4.5;

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          const probLines = doc.splitTextToSize(`Problema: "${ex.problem}"`, contentWidth - 6);
          checkPageBreak(probLines.length * 4);
          doc.text(probLines, margin + 4, y);
          y += probLines.length * 4 + 2;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          const solLines = doc.splitTextToSize(`Resolução Passo a Passo:\n${ex.stepByStepSolution}`, contentWidth - 6);
          checkPageBreak(solLines.length * 4);
          doc.text(solLines, margin + 4, y);
          y += solLines.length * 4 + 2;

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(22, 101, 52);
          const ansLines = doc.splitTextToSize(`Resposta: ${ex.finalAnswer}`, contentWidth - 6);
          checkPageBreak(ansLines.length * 4);
          doc.text(ansLines, margin + 4, y);
          y += ansLines.length * 4 + 3;
        }
      }

      // 4. DICA DE PROVA / MACETE DE ESTUDO
      if (topic.goldenTips) {
        checkPageBreak(15);
        doc.setFillColor(254, 243, 199); // Amber-100
        doc.setDrawColor(245, 158, 11);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9); // Amber-700
        doc.text('💡 DICA DE OURO PARA PROVAS:', margin + 2, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 53, 15);
        const tipLines = doc.splitTextToSize(topic.goldenTips, contentWidth - 4);
        checkPageBreak(tipLines.length * 3.8);
        doc.text(tipLines, margin + 2, y);
        y += tipLines.length * 3.8 + 4;
      }

      // Topic Divider
      y += 3;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    }

    // Add page numbers at bottom of each page
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Trilha do Saber • Estude com IA • Página ${p} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    // Trigger Browser Download
    const cleanFileName = `Resumo_${(filterSubjectName || 'Completo').replace(/[^a-zA-Z0-9]/g, '_')}_${(user.grade || '6ano').replace(/[^a-zA-Z0-9]/g, '')}_Trilha_do_Saber.pdf`;
    doc.save(cleanFileName);
  }

  /**
   * Opens a formatted printable window/dialog for instant paper print or browser PDF export
   */
  public static printSummaries(
    topics: TopicSummaryItem[],
    user: UserProfile,
    filterSubjectName?: string
  ): void {
    const gradeInfo = GRADE_LABELS[user.grade || '6_fund']?.full || 'Ensino Fundamental';
    const currentDate = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Resumo de Estudos - Trilha do Saber</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 16mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      margin: 0;
      padding: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-box {
      background: #1e293b;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header-title {
      font-size: 18px;
      font-weight: 900;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }
    .header-sub {
      font-size: 12px;
      color: #cbd5e1;
      margin: 0;
    }
    .topic-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 18px;
      page-break-inside: avoid;
      background: #ffffff;
    }
    .topic-header {
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      border-left: 4px solid #4f46e5;
    }
    .topic-subject {
      font-size: 11px;
      font-weight: 800;
      color: #4f46e5;
      text-transform: uppercase;
    }
    .topic-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      margin: 12px 0 4px 0;
      letter-spacing: 0.5px;
    }
    .how-it-works-title { color: #1e3a8a; }
    .rules-title { color: #92400e; }
    .examples-title { color: #166534; }
    .tips-title { color: #b45309; }

    .content-p {
      font-size: 12px;
      color: #334155;
      margin: 0 0 8px 0;
    }
    .steps-list {
      margin: 4px 0 10px 0;
      padding-left: 18px;
      font-size: 12px;
      color: #334155;
    }
    .steps-list li {
      margin-bottom: 4px;
    }
    .example-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .ex-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .ex-problem {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
    }
    .ex-sol {
      font-size: 11.5px;
      color: #334155;
      white-space: pre-line;
      margin-bottom: 4px;
    }
    .ex-ans {
      font-size: 12px;
      font-weight: 800;
      color: #166534;
    }
    .tips-box {
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 10px;
    }
    .tips-text {
      font-size: 11.5px;
      color: #78350f;
      margin: 0;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <h1 class="header-title">TRILHA DO SABER • RESUMO DAS MATÉRIAS</h1>
    <p class="header-sub">
      Estudante: <strong>${user.name || 'Estudante'}</strong> | 
      Série: <strong>${gradeInfo}</strong> | 
      Data: <strong>${currentDate}</strong> | 
      Conteúdo: <strong>${filterSubjectName || 'Todas as Matérias'}</strong>
    </p>
  </div>

  ${topics
    .map(
      (topic) => `
    <div class="topic-card">
      <div class="topic-header">
        <h2 class="topic-title">${topic.title}</h2>
        <span class="topic-subject">${topic.subjectName}</span>
      </div>

      <div class="section-title how-it-works-title">📘 Como se faz (Explicação e Passo a Passo):</div>
      <p class="content-p">${topic.howItWorks}</p>

      ${
        topic.keySteps && topic.keySteps.length > 0
          ? `<ul class="steps-list">${topic.keySteps.map((s) => `<li>${s}</li>`).join('')}</ul>`
          : ''
      }

      ${
        topic.rulesAndFormulas && topic.rulesAndFormulas.length > 0
          ? `
        <div class="section-title rules-title">📐 Regras, Fórmulas & Propriedades:</div>
        <ul class="steps-list">${topic.rulesAndFormulas.map((r) => `<li>${r}</li>`).join('')}</ul>
      `
          : ''
      }

      ${
        topic.examples && topic.examples.length > 0
          ? `
        <div class="section-title examples-title">📝 Exemplos Resolvidos:</div>
        ${topic.examples
          .map(
            (ex) => `
          <div class="example-box">
            <div class="ex-title">▶ ${ex.title}</div>
            <div class="ex-problem">Problema: "${ex.problem}"</div>
            <div class="ex-sol"><strong>Resolução:</strong><br>${ex.stepByStepSolution}</div>
            <div class="ex-ans">Resposta: ${ex.finalAnswer}</div>
          </div>
        `
          )
          .join('')}
      `
          : ''
      }

      ${
        topic.goldenTips
          ? `
        <div class="tips-box">
          <div class="section-title tips-title" style="margin-top:0;">💡 Dica de Ouro para Provas:</div>
          <p class="tips-text">${topic.goldenTips}</p>
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('')}

  <div class="footer">
    Trilha do Saber • Plataforma Inteligente de Estudos Escolares • Gerado em ${currentDate}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      // Fallback: create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }
}
