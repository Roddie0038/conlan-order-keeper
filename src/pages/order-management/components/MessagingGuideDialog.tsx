
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MessagingGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessagingGuideDialog({ isOpen, onClose }: MessagingGuideDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Messaging Feature Guide for Store Managers
          </DialogTitle>
        </DialogHeader>
        
        <div className="messaging-guide space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">What Is the Messaging Feature?</h2>
            <p className="text-muted-foreground leading-relaxed">
              The messaging feature allows store managers to send real-time messages to the warehouse or operations team directly from the Order Management page. This enables faster communication, quicker issue resolution, and better tracking of order-specific discussions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Where Can I Use It?</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can access the messaging feature on the <strong>Order Management page</strong>. For each order, you'll now see a <strong>"Message" button</strong> that opens a messaging panel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How It Works:</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Click the <strong>"Message" button</strong> on any order card.</li>
              <li>A message panel will appear.</li>
              <li>Type your message in the box (maximum 1000 characters).</li>
              <li>Click <strong>Send Message</strong>.</li>
              <li>The message will appear in the chat thread for that order, and the warehouse team will be able to view and reply.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Important Notes:</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Messages are <strong>stored per order</strong>, so context is always preserved.</li>
              <li>You <strong>must be assigned to the store</strong> associated with the order to send a message.</li>
              <li>You will see errors if messaging permissions are missing (e.g., not assigned to the store).</li>
              <li>Messages <strong>cannot be deleted</strong> once sent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Example Use Cases:</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Notify warehouse about urgent delivery instructions</li>
              <li>Clarify product substitutions</li>
              <li>Confirm availability of out-of-stock items</li>
              <li>Escalate order issues quickly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Questions or Issues?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you're experiencing problems sending messages, contact your Ordering Platform Conlan Tire administrator or support team at{" "}
              <a 
                href="mailto:rdemarais@conlantire.com" 
                className="text-primary hover:underline"
              >
                rdemarais@conlantire.com
              </a>
              .
            </p>
          </section>

          <section className="border-t pt-4">
            <p className="text-center text-muted-foreground italic">
              Stay connected. Stay informed. Messaging is here to make communication easy.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
