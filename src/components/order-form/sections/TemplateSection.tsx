import { SectionBox } from "@/components/ui/SectionBox";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoSelect, NeoSelectContent, NeoSelectItem, NeoSelectTrigger, NeoSelectValue } from "@/components/ui/NeoSelect";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";


interface TemplateSectionProps {
  getCurrentFormData: () => any;
  onLoadTemplate: (templateData: any) => void;
}

export function TemplateSection({ getCurrentFormData, onLoadTemplate }: TemplateSectionProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const handleSaveTemplate = () => {
    const currentData = getCurrentFormData();
    console.log("Saving template with data:", currentData);
    
    toast({
      title: "Template Saved",
      description: "Your current form has been saved as a template.",
    });
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
                <NeoSelectItem value="template1">Template 1</NeoSelectItem>
                <NeoSelectItem value="template2">Template 2</NeoSelectItem>
              </NeoSelectContent>
            </NeoSelect>
          </div>
        </div>
        
        {/* Template functionality will be added later */}
      </div>
    </SectionBox>
  );
}