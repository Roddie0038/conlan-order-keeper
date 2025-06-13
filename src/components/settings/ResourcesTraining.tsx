
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Eye } from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { MessagingGuideDialog } from "@/components/shared/MessagingGuideDialog";

export interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: 'dialog' | 'pdf';
  category: string;
  lastUpdated: string;
  fileUrl?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const trainingResources: TrainingResource[] = [
  {
    id: 'messaging-guide',
    title: 'How to Use the Messaging Feature',
    description: 'Complete guide on sending messages to warehouse teams directly from order management.',
    type: 'dialog',
    category: 'Communication',
    lastUpdated: '2024-01-15',
    icon: FileText,
  },
  {
    id: 'platform-overview',
    title: 'Platform Overview Guide',
    description: 'Getting started with the Conlan Tire Ordering Platform - basic navigation and features.',
    type: 'pdf',
    category: 'Getting Started',
    lastUpdated: '2024-01-10',
    fileUrl: '/resources/training/platform-overview.pdf',
    icon: FileText,
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management Best Practices',
    description: 'Learn how to effectively manage inventory, check stock levels, and handle out-of-stock situations.',
    type: 'pdf',
    category: 'Inventory',
    lastUpdated: '2024-01-08',
    fileUrl: '/resources/training/inventory-management.pdf',
    icon: FileText,
  },
];

export function ResourcesTraining() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [messagingGuideOpen, setMessagingGuideOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(trainingResources.map(r => r.category)))];

  const filteredResources = trainingResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourceAction = (resource: TrainingResource) => {
    if (resource.type === 'dialog' && resource.id === 'messaging-guide') {
      setMessagingGuideOpen(true);
    } else if (resource.type === 'pdf' && resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search training resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onAction={() => handleResourceAction(resource)}
          />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No training resources found matching your criteria.</p>
        </div>
      )}

      <MessagingGuideDialog 
        isOpen={messagingGuideOpen} 
        onClose={() => setMessagingGuideOpen(false)} 
      />
    </div>
  );
}
