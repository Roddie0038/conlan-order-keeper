
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface OrderTemplateProps {
  type: 'regular' | 'mto' | 'wheel';
  currentData: any;
  onLoadTemplate: (templateData: any) => void;
}

export const OrderTemplate = ({ type, currentData, onLoadTemplate }: OrderTemplateProps) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    // Load templates from localStorage based on type
    const storedTemplates = localStorage.getItem(`${type}Templates`) || '[]';
    try {
      setTemplates(JSON.parse(storedTemplates));
    } catch (e) {
      logger.error("Error parsing templates", {
        service: 'OrderTemplate',
        error: e instanceof Error ? e.message : 'Unknown error'
      });
      setTemplates([]);
    }
  }, [type]);

  const saveTemplate = () => {
    // Generate a unique ID for the template
    const templateId = `template-${Date.now()}`;
    
    // Prompt for template name
    const templateName = window.prompt("Enter a name for this template:");
    if (!templateName) return;
    
    // Create the template object
    const templateData = {
      id: templateId,
      name: templateName,
      data: { ...currentData },
      type,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const updatedTemplates = [...templates, templateData];
    localStorage.setItem(`${type}Templates`, JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    
    toast({
      title: "Template Saved",
      description: "Your template has been saved for future use.",
      variant: "default"
    });
  };

  const handleSelectTemplate = (value: string) => {
    setSelectedTemplate(value);
  };

  const loadTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first.",
        variant: "destructive"
      });
      return;
    }
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      onLoadTemplate(template.data);
    }
  };

  const deleteTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to delete.",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = templates.filter(t => t.id !== selectedTemplate);
      localStorage.setItem(`${type}Templates`, JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
      setSelectedTemplate("");
      
      toast({
        title: "Template Deleted",
        description: "The template has been removed.",
        variant: "default"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Order Templates</h3>
        <p className="text-sm text-gray-500">
          Save and load common order configurations to save time.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={saveTemplate} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Current as Template
        </Button>
        
        <div className="flex items-center gap-2 flex-grow">
          <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.length === 0 ? (
                <SelectItem value="no-templates" disabled>
                  No saved templates
                </SelectItem>
              ) : (
                templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={loadTemplate} 
            disabled={!selectedTemplate} 
            className="whitespace-nowrap"
          >
            Load
          </Button>
          
          <Button 
            onClick={deleteTemplate} 
            disabled={!selectedTemplate}
            variant="outline" 
            className="text-red-500 hover:text-red-700 whitespace-nowrap"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTemplate;
