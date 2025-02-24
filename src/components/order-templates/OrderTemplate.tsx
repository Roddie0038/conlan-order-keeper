
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Template {
  id: string;
  name: string;
  type: 'regular' | 'mto';
  data: any;
}

interface OrderTemplateProps {
  type: 'regular' | 'mto';
  currentData: any;
  onLoadTemplate: (template: any) => void;
}

export const OrderTemplate = ({ type, currentData, onLoadTemplate }: OrderTemplateProps) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(`${type}Templates`);
    return saved ? JSON.parse(saved) : [];
  });

  const [templateName, setTemplateName] = useState('');

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: templateName,
      type,
      data: currentData
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem(`${type}Templates`, JSON.stringify(updatedTemplates));
    
    toast({
      title: "Template Saved",
      description: "Your order template has been saved successfully."
    });
    
    setTemplateName('');
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem(`${type}Templates`, JSON.stringify(updatedTemplates));
    
    toast({
      title: "Template Deleted",
      description: "The template has been removed."
    });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Order Templates</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md dark:bg-slate-700"
        />
        <Button onClick={saveTemplate} variant="outline">
          Save as Template
        </Button>
      </div>

      <div className="space-y-2">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-700 rounded-md">
              <span className="flex-1 font-medium">{template.name}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onLoadTemplate(template.data)}
                >
                  Load
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No saved templates yet</p>
        )}
      </div>
    </div>
  );
};
