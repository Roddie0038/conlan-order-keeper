
import { toast as sonnerToast } from "sonner";
import { type ToastProps } from "@/components/ui/toast";

// Create a hook that returns the same interface as ShadCN's useToast
export function useToast() {
  return {
    toast: (props: ToastProps) => {
      return {
        id: "1",
        dismiss: () => {},
        update: () => {}
      };
    },
    dismiss: (toastId?: string) => {},
    toasts: [] as ToastProps[]
  };
}

// Re-export the toast function from sonner for direct usage
export const toast = sonnerToast;
