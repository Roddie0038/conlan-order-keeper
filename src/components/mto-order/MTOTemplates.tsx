import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MTOFormData } from "./mto-form-config";
import { Save, FileDown, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
interface MTOTemplatesProps {
  currentFormData: MTOFormData;
  onLoadTemplate: (template: MTOFormData) => void;
}
export const MTOTemplates = ({
  currentFormData,
  onLoadTemplate
}: MTOTemplatesProps) => {
  const {
    toast
  } = useToast();
  const saveTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('mtoTemplates') || '[]');
    const templateName = `Template ${templates.length + 1}`;
    const newTemplate = {
      name: templateName,
      data: {
        ...currentFormData,
        timestamp: new Date().toLocaleString() // Update timestamp
      }
    };
    templates.push(newTemplate);
    localStorage.setItem('mtoTemplates', JSON.stringify(templates));
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved.`
    });
  };
  const deleteTemplate = (templateName: string) => {
    const templates = JSON.parse(localStorage.getItem('mtoTemplates') || '[]');
    const filteredTemplates = templates.filter((t: any) => t.name !== templateName);
    localStorage.setItem('mtoTemplates', JSON.stringify(filteredTemplates));
    toast({
      title: "Template Deleted",
      description: `Template "${templateName}" has been deleted.`
    });
  };
  const loadTemplate = (templateName: string) => {
    const templates = JSON.parse(localStorage.getItem('mtoTemplates') || '[]');
    const template = templates.find((t: any) => t.name === templateName);
    if (template) {
      onLoadTemplate(template.data);
      toast({
        title: "Template Loaded",
        description: `Template "${templateName}" has been loaded.`
      });
    }
  };
  const getTemplates = () => {
    return JSON.parse(localStorage.getItem('mtoTemplates') || '[]');
  };
  return <div className="flex gap-4 items-center mb-6">
      <Button onClick={saveTemplate} variant="outline" className="flex items-center gap-2 text-slate-950 bg-zinc-500 hover:bg-zinc-400 text-xl rounded-3xl">
        <Save className="w-4 h-4" />
        Save as Template
      </Button>

      <div className="flex items-center gap-2">
        <FileDown className="w-4 h-4" />
        <Select onValueChange={loadTemplate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Load Template" />
          </SelectTrigger>
          <SelectContent>
            {getTemplates().map((template: any) => <SelectItem key={template.name} value={template.name} className="flex items-center justify-between group">
                <span>{template.name}</span>
                <Button variant="ghost" size="sm" className="hidden group-hover:flex items-center ml-2 h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={e => {
              e.stopPropagation();
              deleteTemplate(template.name);
            }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>;
};