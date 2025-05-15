
import { toast as sonnerToast, ToastT } from "sonner";

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
      sonnerToast.error(title || "", {
        description,
        className,
        action
      });
    } else if (variant === "warning") {
      sonnerToast.warning(title || "", {
        description,
        className,
        action
      });
    } else {
      sonnerToast.success(title || "", {
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
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
    toasts: [] as ToastProps[]
  };
}

// Add convenience methods to sonnerToast
const toast = {
  ...sonnerToast,
  // Add support for our object style API with title/description
  success: (titleOrOptions: string | { title?: string, description?: string }, options?: any) => {
    if (typeof titleOrOptions === 'object') {
      return sonnerToast.success(titleOrOptions.title || "", {
        description: titleOrOptions.description,
        ...options
      });
    }
    return sonnerToast.success(titleOrOptions, options);
  },
  error: (titleOrOptions: string | { title?: string, description?: string }, options?: any) => {
    if (typeof titleOrOptions === 'object') {
      return sonnerToast.error(titleOrOptions.title || "", {
        description: titleOrOptions.description,
        ...options
      });
    }
    return sonnerToast.error(titleOrOptions, options);
  },
  warning: (titleOrOptions: string | { title?: string, description?: string }, options?: any) => {
    if (typeof titleOrOptions === 'object') {
      return sonnerToast.warning(titleOrOptions.title || "", {
        description: titleOrOptions.description,
        ...options
      });
    }
    return sonnerToast.warning(titleOrOptions, options);
  },
  info: (titleOrOptions: string | { title?: string, description?: string }, options?: any) => {
    if (typeof titleOrOptions === 'object') {
      return sonnerToast.info(titleOrOptions.title || "", {
        description: titleOrOptions.description,
        ...options
      });
    }
    return sonnerToast.info(titleOrOptions, options);
  }
};

export { toast };
