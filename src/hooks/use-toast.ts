
import { sonnerToast as sonner, type ToastT } from "sonner";

// Create a type that includes description for our toast calls
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning';
  className?: string;
  action?: React.ReactNode;
}

// Create a hook that returns the same interface as ShadCN's useToast
export function useToast() {
  const toast = (props: ToastProps) => {
    const { title, description, variant, className, action } = props;
    
    // Determine toast type based on variant
    if (variant === "destructive") {
      sonner.error(title || "", {
        description,
        className,
        action
      });
    } else if (variant === "warning") {
      sonner.warning(title || "", {
        description,
        className,
        action
      });
    } else {
      sonner.success(title || "", {
        description,
        className,
        action
      });
    }
    
    return {
      id: "1",
      dismiss: () => {},
      update: () => {}
    };
  };
  
  return {
    toast,
    dismiss: (toastId?: string) => sonner.dismiss(toastId),
    toasts: [] as ToastProps[]
  };
}

// Create a callable toast function with convenience methods
type ToastFunction = ((props: ToastProps) => void) & {
  success: typeof sonner.success;
  error: typeof sonner.error;
  warning: typeof sonner.warning;
  info: typeof sonner.info;
};

// Base toast function
const toastBase = (props: ToastProps) => {
  const { toast } = useToast();
  return toast(props);
};

// Add convenience methods to the callable function
const toast = toastBase as ToastFunction;
toast.success = sonner.success;
toast.error = sonner.error;
toast.warning = sonner.warning;
toast.info = sonner.info;

export { toast };
