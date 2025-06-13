
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText, Video, BookOpen } from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { VideoPlayerDialog } from "./VideoPlayerDialog";
import { MessagingGuideDialog } from "@/components/shared/MessagingGuideDialog";
import type { TrainingResource } from "./types";

const trainingResources: TrainingResource[] = [
  {
    id: 'messaging-guide',
    title: 'How to Use the Messaging Feature',
    description: 'Complete guide on sending messages to warehouse teams directly from order management.',
    type: 'dialog',
    category: 'Communication',
    lastUpdated: '2024-01-15',
    version: '2.1',
    changelog: [
      {
        version: '2.1',
        date: '2024-01-15',
        changes: [
          'Added role-based messaging permissions',
          'Improved error handling for message delivery',
          'Updated UI for better mobile experience'
        ],
        type: 'minor'
      },
      {
        version: '2.0',
        date: '2024-01-01',
        changes: [
          'Complete redesign of messaging interface',
          'Added real-time message notifications',
          'Implemented message thread history'
        ],
        type: 'major'
      }
    ],
    icon: FileText,
  },
  {
    id: 'platform-overview-video',
    title: 'Platform Overview - Video Walkthrough',
    description: 'A comprehensive video tour of the Conlan Tire Ordering Platform showing all major features and navigation.',
    type: 'video',
    category: 'Getting Started',
    lastUpdated: '2024-01-20',
    version: '1.0',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '12:30',
    thumbnail: '/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png',
    icon: Video,
  },
  {
    id: 'platform-overview',
    title: 'Platform Overview Guide',
    description: 'Getting started with the Conlan Tire Ordering Platform - basic navigation and features.',
    type: 'pdf',
    category: 'Getting Started',
    lastUpdated: '2024-01-10',
    version: '1.3',
    changelog: [
      {
        version: '1.3',
        date: '2024-01-10',
        changes: [
          'Updated screenshots for new UI',
          'Added troubleshooting section',
          'Clarified login procedures'
        ],
        type: 'patch'
      }
    ],
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
    version: '2.0',
    changelog: [
      {
        version: '2.0',
        date: '2024-01-08',
        changes: [
          'Added cross-dock inventory procedures',
          'New section on seasonal inventory planning',
          'Updated vendor contact information'
        ],
        type: 'major'
      }
    ],
    fileUrl: '/resources/training/inventory-management.pdf',
    icon: BookOpen,
  },
  {
    id: 'order-management-video',
    title: 'Order Management Deep Dive',
    description: 'Advanced video tutorial covering order processing, status tracking, and warehouse communication.',
    type: 'video',
    category: 'Order Processing',
    lastUpdated: '2024-01-12',
    version: '1.1',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '18:45',
    thumbnail: '/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png',
    changelog: [
      {
        version: '1.1',
        date: '2024-01-12',
        changes: [
          'Added messaging feature demonstration',
          'Updated order status explanations',
          'Improved audio quality'
        ],
        type: 'minor'
      }
    ],
    icon: Video,
  },
];

export function ResourcesTraining() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [messagingGuideOpen, setMessagingGuideOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TrainingResource | null>(null);

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
    } else if (resource.type === 'video') {
      setSelectedVideo(resource);
      setVideoDialogOpen(true);
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

      {selectedVideo && (
        <VideoPlayerDialog
          isOpen={videoDialogOpen}
          onClose={() => {
            setVideoDialogOpen(false);
            setSelectedVideo(null);
          }}
          title={selectedVideo.title}
          videoUrl={selectedVideo.videoUrl}
          embedCode={selectedVideo.embedCode}
        />
      )}
    </div>
  );
}
