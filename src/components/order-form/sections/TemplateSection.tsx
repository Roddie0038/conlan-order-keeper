import { SectionBox } from "@/components/ui/SectionBox";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoSelect, NeoSelectContent, NeoSelectItem, NeoSelectTrigger, NeoSelectValue } from "@/components/ui/NeoSelect";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";


interface TemplateSectionProps {
  getCurrentFormData: () => any;
  onLoadTemplate: (templateData: any) => void;
}

export function TemplateSection({ getCurrentFormData, onLoadTemplate }: TemplateSectionProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    // Load existing templates from localStorage
    const storedTemplates = localStorage.getItem('regularTemplates') || '[]';
    try {
      setTemplates(JSON.parse(storedTemplates));
    } catch (e) {
      console.error("Error parsing templates:", e);
      setTemplates([]);
    }
  }, []);

  const handleSaveTemplate = () => {
    const currentData = getCurrentFormData();
    console.log("Saving template with data:", currentData);
    
    // Prompt for template name
    const templateName = window.prompt("Enter a name for this template:");
    if (!templateName) return;
    
    // Generate a unique ID for the template
    const templateId = `template-${Date.now()}`;
    
    // Create the template object
    const templateData = {
      id: templateId,
      name: templateName,
      data: { ...currentData },
      type: 'regular',
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const updatedTemplates = [...templates, templateData];
    localStorage.setItem('regularTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved for future use.`,
    });
  };

  const handleLoadTemplate = () => {
    if (!selectedTemplateId) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first.",
        variant: "destructive"
      });
      return;
    }
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      onLoadTemplate(template.data);
      toast({
        title: "Template Loaded",
        description: `Template "${template.name}" has been loaded.`,
      });
    }
  };

  return (
    <SectionBox title="NEW ORDER FORM" tone="cyan">
      <div className="space-y-4">
        <p className="text-sm text-neutral-400">Please fill out all required fields</p>
        
        <div className="flex gap-4">
          <NeoButton 
            type="button"
            variant="ghost"
            onClick={handleSaveTemplate}
            className="flex-1"
          >
            Save Current as Template
          </NeoButton>
          
          <div className="flex-1">
            <NeoSelect
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <NeoSelectTrigger>
                <NeoSelectValue placeholder="Select a template" />
              </NeoSelectTrigger>
              <NeoSelectContent>
                {templates.length === 0 ? (
                  <NeoSelectItem value="no-templates" disabled>
                    No saved templates
                  </NeoSelectItem>
                ) : (
                  templates.map((template) => (
                    <NeoSelectItem key={template.id} value={template.id}>
                      {template.name}
                    </NeoSelectItem>
                  ))
                )}
              </NeoSelectContent>
            </NeoSelect>
          </div>
          
          <NeoButton 
            type="button"
            variant="ghost"
            onClick={handleLoadTemplate}
            disabled={!selectedTemplateId}
            className="px-4"
          >
            Load
          </NeoButton>
        </div>
      </div>
    </SectionBox>
  );
}