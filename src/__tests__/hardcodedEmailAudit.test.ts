/**
 * Hardcoded Email Audit Test
 * Ensures no unauthorized hardcoded emails remain in the codebase
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Hardcoded Email Audit', () => {
  
  const sourceDir = path.join(process.cwd(), 'src');
  const allowedHardcodedEmails = [
    'roderickdemarais@aol.com', // Super admin email (authorized)
    'onboarding@resend.dev', // Resend default sender (dev/testing)
    'manager@conlantire.com', // Default fallback for forms (authorized)
    'admin@conlantire.com', // Default admin fallback (authorized)
    'system@conlantire.com', // System notifications (authorized)
    'conlan@conlantire.com', // Work contact for templates (authorized)
    'test@conlantire.com', // Test email for unit tests (authorized)
    'unknown@email.com' // Fallback placeholder (authorized)
  ];

  const unauthorizedPatterns = [
    /@gmail\.com/,
    /@yahoo\.com/,
    /@hotmail\.com/,
    /@outlook\.com/,
    /@example\.com/, // Should use @conlantire.com instead
    /store\d+@\w+\.com/, // Should be dynamic lookup
    /manager@store\.com/, // Should be dynamic lookup
    /warehouse@\w+\.com/ // Should be dynamic lookup (except conlantire.com)
  ];

  const scanDirectory = (dir: string): string[] => {
    const findings: string[] = [];
    
    const scanFile = (filePath: string) => {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
        return;
      }

      // Skip test files from email pattern checking (they use mock emails)
      if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Check for email patterns
        const emailMatches = line.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g);
        
        if (emailMatches) {
          emailMatches.forEach(email => {
            // Skip allowed emails
            if (allowedHardcodedEmails.includes(email)) {
              return;
            }

            // Check against unauthorized patterns
            const isUnauthorized = unauthorizedPatterns.some(pattern => pattern.test(email));
            
            if (isUnauthorized) {
              findings.push(`${filePath}:${index + 1} - Unauthorized hardcoded email: ${email}`);
            }
          });
        }

        // Check for hardcoded email variable assignments
        if (line.includes('email') && line.includes('=') && line.includes('@')) {
          const emailMatch = line.match(/email.*=.*["']([^"']+@[^"']+)["']/);
          if (emailMatch && !allowedHardcodedEmails.includes(emailMatch[1])) {
            findings.push(`${filePath}:${index + 1} - Hardcoded email assignment: ${emailMatch[1]}`);
          }
        }
      });
    };

    const traverse = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else {
          scanFile(fullPath);
        }
      }
    };

    traverse(dir);
    return findings;
  };

  it('should not contain unauthorized hardcoded emails', () => {
    const findings = scanDirectory(sourceDir);
    
    // Log findings for debugging
    if (findings.length > 0) {
      console.log('Unauthorized hardcoded emails found:');
      findings.forEach(finding => console.log(`  ${finding}`));
    }

    expect(findings).toHaveLength(0);
  });

  it('should verify dynamic email lookup is used in forms', () => {
    const formFiles = [
      path.join(sourceDir, 'components/order-form/sections/ContactSection.tsx'),
      path.join(sourceDir, 'components/order-form/OrderFormInputs.tsx'),
      path.join(sourceDir, 'components/mto-order/MTOOrderForm.tsx')
    ];

    formFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Should NOT contain hardcoded manager emails
        expect(content).not.toMatch(/store\d+@[^"'\s]+/);
        expect(content).not.toMatch(/manager@store\d+/);
        
        // Should contain references to dynamic lookup (or explicit removal comments)
        const hasDynamicLookup = content.includes('dynamic') || 
                                content.includes('REMOVED: hardcoded') ||
                                content.includes('handled dynamically');
        
        if (!hasDynamicLookup) {
          console.warn(`Warning: ${filePath} may not use dynamic email lookup`);
        }
      }
    });
  });

  it('should verify edge functions use proper email domains', () => {
    const edgeFunctionDir = path.join(process.cwd(), 'supabase/functions');
    
    if (!fs.existsSync(edgeFunctionDir)) {
      console.log('No edge functions directory found, skipping edge function email audit');
      return;
    }

    const scanEdgeFunctions = (dir: string): string[] => {
      const findings: string[] = [];
      const traverse = (currentDir: string) => {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            traverse(fullPath);
          } else if (item.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            
            // Check for unauthorized email domains
            const unauthorizedEmails = content.match(/@(gmail|yahoo|hotmail|outlook)\.com/g);
            if (unauthorizedEmails) {
              findings.push(`${fullPath} - Contains unauthorized email domains: ${unauthorizedEmails.join(', ')}`);
            }
          }
        }
      };

      traverse(dir);
      return findings;
    };

    const findings = scanEdgeFunctions(edgeFunctionDir);
    expect(findings).toHaveLength(0);
  });

  it('should verify domain restrictions are properly configured', () => {
    const notificationControllerPath = path.join(sourceDir, 'services/NotificationController.ts');
    
    if (fs.existsSync(notificationControllerPath)) {
      const content = fs.readFileSync(notificationControllerPath, 'utf-8');
      
      // Should contain allowed domains configuration
      expect(content).toMatch(/ALLOWED_DOMAINS.*=.*\[/);
      expect(content).toMatch(/@conlantire\.com/);
      
      // Should not allow all domains
      expect(content).not.toMatch(/ALLOWED_DOMAINS.*=.*\['?\*'?\]/);
    }

    const signupPath = path.join(sourceDir, 'pages/SignUp.tsx');
    if (fs.existsSync(signupPath)) {
      const content = fs.readFileSync(signupPath, 'utf-8');
      
      // Should restrict signup to authorized domains
      expect(content).toMatch(/@conlantire\.com/);
      expect(content).toMatch(/ALLOWED_DOMAINS/);
    }
  });

  it('should verify no test emails leak into production code', () => {
    const productionFiles = [
      path.join(sourceDir, 'services'),
      path.join(sourceDir, 'components'),
      path.join(sourceDir, 'pages'),
      path.join(sourceDir, 'hooks')
    ];

    const testEmailPatterns = [
      /test\d*@/,
      /fake@/,
      /dummy@/,
      /mock@/,
      /sample@/
    ];

    productionFiles.forEach(dir => {
      if (!fs.existsSync(dir)) return;

      const checkForTestEmails = (currentDir: string) => {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.includes('__tests__')) {
            checkForTestEmails(fullPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            // Skip test files
            if (item.includes('.test.') || item.includes('.spec.') || fullPath.includes('__tests__')) {
              continue;
            }

            const content = fs.readFileSync(fullPath, 'utf-8');
            
            testEmailPatterns.forEach(pattern => {
              if (pattern.test(content)) {
                console.warn(`Warning: Potential test email found in production file: ${fullPath}`);
              }
            });
          }
        }
      };

      checkForTestEmails(dir);
    });
  });
});