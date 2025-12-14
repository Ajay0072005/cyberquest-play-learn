import React from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Award, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SherlockCertificateProps {
  completionDate: Date;
}

export const SherlockCertificate: React.FC<SherlockCertificateProps> = ({ completionDate }) => {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'Detective';

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, width, height, 'F');

    // Border
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(2);
    doc.rect(10, 10, width - 20, height - 20);
    
    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, width - 30, height - 30);

    // Decorative corners
    doc.setLineWidth(1);
    const cornerSize = 15;
    // Top left
    doc.line(10, 25, 25, 25);
    doc.line(25, 10, 25, 25);
    // Top right
    doc.line(width - 25, 10, width - 25, 25);
    doc.line(width - 25, 25, width - 10, 25);
    // Bottom left
    doc.line(10, height - 25, 25, height - 25);
    doc.line(25, height - 10, 25, height - 25);
    // Bottom right
    doc.line(width - 25, height - 10, width - 25, height - 25);
    doc.line(width - 25, height - 25, width - 10, height - 25);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text('CYBERQUEST ACADEMY', width / 2, 35, { align: 'center' });

    // Certificate text
    doc.setFontSize(36);
    doc.setTextColor(255, 255, 255);
    doc.text('CERTIFICATE OF COMPLETION', width / 2, 55, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text('This certifies that', width / 2, 75, { align: 'center' });

    // Name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(userName.toUpperCase(), width / 2, 92, { align: 'center' });

    // Line under name
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    const nameWidth = doc.getTextWidth(userName.toUpperCase());
    doc.line((width - nameWidth) / 2 - 20, 97, (width + nameWidth) / 2 + 20, 97);

    // Has completed text
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', width / 2, 110, { align: 'center' });

    // Course name
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('The Sherlock Method:', width / 2, 125, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(251, 191, 36);
    doc.text('Deductive Analysis & OSINT', width / 2, 135, { align: 'center' });

    // Skills acquired
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    const skills = [
      '• The Art of Observation',
      '• Digital Footprint Analysis', 
      '• OSINT Framework Mastery',
      '• Victorian Escape Room Challenge'
    ];
    doc.text(skills, width / 2, 150, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    const formattedDate = completionDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Issued on ${formattedDate}`, width / 2, 180, { align: 'center' });

    // Certificate ID
    const certId = `CERT-SH-${Date.now().toString(36).toUpperCase()}`;
    doc.setFontSize(8);
    doc.text(`Certificate ID: ${certId}`, width / 2, 188, { align: 'center' });

    // Save PDF
    doc.save(`CyberQuest-Sherlock-Certificate-${userName}.pdf`);
  };

  return (
    <Card className="cyber-bg border-amber-500/50 mt-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <Award className="h-12 w-12 text-green-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-400 uppercase tracking-wider font-medium">
                Course Completed
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">Download Your Certificate</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Congratulations, Detective! You've mastered the Sherlock Method. Download your official certificate of completion.
            </p>
            <Button 
              onClick={generatePDF}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate (PDF)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
