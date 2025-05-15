
import { toast as sonnerToast } from "sonner";
import {
  useToast as useToastShadcn
} from "@/components/ui/toast";

// Re-export the hooks
export const useToast = useToastShadcn;

// Re-export the toast function
export const toast = sonnerToast;
