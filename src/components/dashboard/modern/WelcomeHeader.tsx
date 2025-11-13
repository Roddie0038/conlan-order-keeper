import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { otClient } from "@/integrations/ot-platform/client";

interface OTPlatformUser {
  full_name: string;
  store: string;
  role: string;
}

export function WelcomeHeader() {
  const { user } = useAuth();
  const [otUser, setOtUser] = useState<OTPlatformUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOTPlatformUser = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await otClient
          .from('ot_platform_users')
          .select('full_name, store, role')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching OT Platform user:', error);
        } else if (data) {
          setOtUser(data);
        }
      } catch (error) {
        console.error('Error fetching OT Platform user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOTPlatformUser();
  }, [user?.email]);

  const displayName = otUser?.full_name || user?.name || user?.email;
  const displayStore = otUser?.store || user?.storeName || user?.store || "N/A";
  const displayRole = otUser?.role || user?.title || "Team Member";

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2 text-foreground">
        Welcome, {loading ? "..." : displayName}
      </h1>
      <p className="text-lg text-muted-foreground">
        {displayStore} · {displayRole}
      </p>
    </div>
  );
}
