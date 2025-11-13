import { useAuth } from "@/contexts/AuthContext";

export function WelcomeHeader() {
  const { user } = useAuth();

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2">
        Welcome, {user?.name || user?.email}
      </h1>
      <p className="text-lg text-muted-foreground">
        {user?.storeName || user?.store} · {user?.title || "Team Member"}
      </p>
    </div>
  );
}
