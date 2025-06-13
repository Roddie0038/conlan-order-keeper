
# Training Resources

This directory contains training materials and guides for the Conlan Tire Ordering Platform.

## File Structure
- `platform-overview.pdf` - General platform overview and getting started guide
- `inventory-management.pdf` - Best practices for inventory management
- `messaging-guide.pdf` - How to use the messaging feature (also available as embedded HTML)

## Adding New Resources
1. Place PDF files in this directory
2. Update the `trainingResources` array in `src/components/settings/ResourcesTraining.tsx`
3. Follow the naming convention: lowercase with hyphens

## File Naming Convention
- Use lowercase letters
- Separate words with hyphens
- Include version numbers if needed (e.g., `platform-overview-v2.pdf`)
