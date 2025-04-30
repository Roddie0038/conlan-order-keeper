
/**
 * Deployment Service for Vercel API integrations
 */

// Use our production deploy hook URL from Vercel
const VERCEL_DEPLOY_HOOK_MAIN = "https://api.vercel.com/v1/integrations/deploy/prj_Q68iO56syOvHVUvaLAbCLi1dyQaR/SoxhuMzHBs";

/**
 * Triggers a deployment to the production environment using Vercel's deploy hook
 */
export async function triggerProductionDeployment(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(VERCEL_DEPLOY_HOOK_MAIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Deployment failed: ${response.status} ${response.statusText}`);
    }

    // Optionally, you may parse and log additional data if needed:
    const data = await response.json();
    return { 
      success: true, 
      message: "Deployment successfully triggered" 
    };
  } catch (error) {
    console.error("Deployment error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}

/**
 * Get information about the most recent deployment.
 * This is a placeholder function for future Vercel API integrations.
 */
export async function getDeploymentStatus(): Promise<{ lastDeployed: string | null }> {
  // For now, just return the current time.
  return {
    lastDeployed: new Date().toISOString()
  };
}
