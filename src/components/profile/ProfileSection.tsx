import { ReactNode, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ProfileSectionProps {
  title: string;
  placeholder: string;
  isEmpty: boolean;
  addLabel: string;
  children: ReactNode;
  editForm: ReactNode;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
}

export const ProfileSection = ({
  title,
  placeholder,
  isEmpty,
  addLabel,
  children,
  editForm,
  isEditing,
  onEditToggle,
}: ProfileSectionProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <Card className="bg-card border-border border-dashed">
        <CardContent className="p-5">
          {isEditing ? (
            editForm
          ) : isEmpty ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-muted-foreground text-sm">{placeholder}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditToggle(true)}
                className="text-primary hover:text-primary/80 gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                {addLabel}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {children}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditToggle(true)}
                className="text-primary hover:text-primary/80 gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
