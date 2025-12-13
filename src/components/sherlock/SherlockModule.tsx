import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface Module {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  content: string[];
}

interface SherlockModuleProps {
  module: Module;
  onComplete: () => void;
  onBack: () => void;
  isCompleted: boolean;
}

export const SherlockModule: React.FC<SherlockModuleProps> = ({
  module,
  onComplete,
  onBack,
  isCompleted
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const contentPerPage = 4;
  const totalPages = Math.ceil(module.content.length / contentPerPage);
  
  const currentContent = module.content.slice(
    currentPage * contentPerPage,
    (currentPage + 1) * contentPerPage
  );

  const isLastPage = currentPage === totalPages - 1;

  const handleNext = () => {
    if (isLastPage) {
      onComplete();
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="bg-primary/20">
            <BookOpen className="h-3 w-3 mr-1" />
            {module.subtitle}
          </Badge>
        </div>

        {/* Module Content */}
        <Card className="cyber-bg border-primary/30 mb-6">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                {module.icon}
              </div>
              <div>
                <CardTitle className="text-2xl font-cyber">{module.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{module.description}</p>
              </div>
              {isCompleted && (
                <CheckCircle className="h-6 w-6 text-green-500 ml-auto" />
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-invert max-w-none">
              {currentContent.map((paragraph, index) => (
                <div key={index} className="mb-4">
                  {paragraph.startsWith('##') ? (
                    <h2 className="text-xl font-bold text-primary mb-3 mt-6">
                      {paragraph.replace(/^##\s/, '')}
                    </h2>
                  ) : paragraph.startsWith('###') ? (
                    <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">
                      {paragraph.replace(/^###\s/, '')}
                    </h3>
                  ) : paragraph.startsWith('**') ? (
                    <p className="text-foreground leading-relaxed pl-4 border-l-2 border-primary/50">
                      <MarkdownRenderer content={paragraph} />
                    </p>
                  ) : paragraph.startsWith('"') ? (
                    <blockquote className="border-l-4 border-amber-500/50 pl-4 py-2 italic text-amber-200/90 bg-amber-500/10 rounded-r">
                      {paragraph}
                    </blockquote>
                  ) : paragraph.match(/^\d\./) ? (
                    <p className="text-foreground leading-relaxed pl-4">
                      <MarkdownRenderer content={paragraph} />
                    </p>
                  ) : paragraph.startsWith('-') ? (
                    <p className="text-muted-foreground leading-relaxed pl-6">
                      {paragraph}
                    </p>
                  ) : (
                    <p className="text-foreground leading-relaxed">
                      <MarkdownRenderer content={paragraph} />
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === currentPage ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className={isLastPage ? 'bg-gradient-to-r from-primary to-secondary' : ''}
              >
                {isLastPage ? 'Complete & Take Quiz' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
