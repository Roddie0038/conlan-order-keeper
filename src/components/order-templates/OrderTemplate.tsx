import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Save } from "lucide-react";
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
export const OrderTemplate = ({
  type,
  currentData,
  onLoadTemplate
}: OrderTemplateProps) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(`${type}Templates`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'new') {
      setShowSaveForm(true);
      setSelectedTemplate('');
    } else {
      setShowSaveForm(false);
      setSelectedTemplate(templateId);
      const template = templates.find(t => t.id === templateId);
      if (template) {
        onLoadTemplate(template.data);
      }
    }
  };
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
    setShowSaveForm(false);
  };
  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem(`${type}Templates`, JSON.stringify(updatedTemplates));
    if (selectedTemplate === id) {
      setSelectedTemplate('');
    }
    toast({
      title: "Template Deleted",
      description: "The template has been removed."
    });
  };
  return <div className="mb-6 space-y-4">
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template or create new" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create New Template</SelectItem>
              {templates.map(template => <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {templates.length > 0 && <div className="flex gap-2">
            {selectedTemplate && <Button variant="destructive" size="icon" onClick={() => deleteTemplate(selectedTemplate)}>
                <Trash2 className="h-4 w-4" />
              </Button>}
          </div>}
      </div>

      {showSaveForm && <div className="flex gap-2">
          <input type="text" placeholder="Enter template name" value={templateName} onChange={e => setTemplateName(e.target.value)} className="flex-1 py-2 border bg-green-300 mx-[150px] rounded-xl px-[120px]" />
          <Button onClick={saveTemplate} variant="outline" className="gap-2 bg-green-400 hover:bg-green-300 text-slate-950">
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>}
    </div>;
};