import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageTemplate } from '@/services/advancedMessageService';
import { X, Zap } from 'lucide-react';

interface QuickReplyTemplatesProps {
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
  onCancel: () => void;
}

export function QuickReplyTemplates({ templates, onSelect, onCancel }: QuickReplyTemplatesProps) {
  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Quick Reply Templates</span>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {categories.map(category => (
          <div key={category} className="space-y-2">
            <Badge variant="outline" className="text-xs capitalize">
              {category}
            </Badge>
            <div className="grid grid-cols-1 gap-2">
              {templates
                .filter(t => t.category === category)
                .slice(0, 3)
                .map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(template)}
                    className="justify-start text-left h-auto py-2 px-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-xs">{template.title}</span>
                        {template.usage_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="h-2 w-2 mr-1" />
                            {template.usage_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.content}
                      </p>
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}