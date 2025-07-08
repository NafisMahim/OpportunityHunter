// Quick script to run NYC opportunity extraction
const { dataImporter } = require('./server/data-importer.ts');

async function runExtraction() {
  console.log('🏙️ Starting massive NYC opportunity extraction...');
  try {
    await dataImporter.importMassiveNYCOpportunities();
    console.log('✅ NYC extraction completed successfully!');
  } catch (error) {
    console.error('❌ Error during extraction:', error);
  }
  process.exit(0);
}

runExtraction();