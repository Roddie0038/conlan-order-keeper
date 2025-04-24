
/**
 * Environment configuration for the application
 * This allows us to easily switch between staging and production environments
 */

// Environment types
export type Environment = 'production' | 'staging';

// Current environment
// This can be set based on deployment or build parameters
// Default to 'production' if not specified
export const currentEnvironment: Environment = 
  (import.meta.env.VITE_ENVIRONMENT as Environment) || 'production';

// Check if we're in staging mode
export const isStaging = currentEnvironment === 'staging';

// Check if we're in production mode
export const isProduction = currentEnvironment === 'production';

// Environment-specific configuration
export interface EnvironmentConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Environment configurations
const environments: Record<Environment, EnvironmentConfig> = {
  production: {
    apiUrl: 'https://cdbixtaqjppvdkyfbhkz.supabase.co',
    supabaseUrl: 'https://cdbixtaqjppvdkyfbhkz.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10',
  },
  staging: {
    // For staging, you would replace these with your staging Supabase project credentials
    // These are placeholder values until you create your staging Supabase project
    apiUrl: 'https://your-staging-project.supabase.co',
    supabaseUrl: 'https://your-staging-project.supabase.co',
    supabaseAnonKey: 'your-staging-anon-key',
  }
};

// Get environment-specific configuration
export const config = environments[currentEnvironment];

// Log the current environment during development
if (import.meta.env.DEV) {
  console.log(`🔧 Running in ${currentEnvironment} environment`);
}
