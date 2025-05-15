
import { toast as sonner, type Toast } from "sonner";

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
interface ToastFunction {
  (props: ToastProps): void;
  success: typeof sonner.success;
  error: typeof sonner.error;
  warning: typeof sonner.warning;
  info: typeof sonner.info;
}

// Create a base toast function
const toastFn = (props: ToastProps) => {
  const { toast } = useToast();
  toast(props);
};

// Create the final toast object with the convenience methods
const toast = Object.assign(toastFn, {
  success: sonner.success,
  error: sonner.error,
  warning: sonner.warning,
  info: sonner.info
}) as ToastFunction;

export { toast };
