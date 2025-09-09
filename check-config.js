const fs = require('fs');
const path = require('path');

const files = [
  '.env',
  '.env.development',
  '.npmrc',
  'config-overrides.js',
  'package.json'
];

// Définition des contenus attendus
const expectedContents = {
  '.env': `SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
FAST_REFRESH=false
NODE_ENV=development
BROWSER=none`,

  '.env.development': `SKIP_PREFLIGHT_CHECK=true
FAST_REFRESH=false`,

  '.npmrc': `legacy-peer-deps=true
node-modules-dir=true
save-exact=true`
};

console.log('🔍 Vérification des fichiers de configuration :');
console.log('============================================\n');

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  console.log(`📁 Vérification de ${file}:`);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
    
    // Vérification du contenu pour les fichiers spécifiques
    if (expectedContents[file]) {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      console.log(`📝 Contenu actuel :\n${content}\n`);
      console.log(`📋 Contenu attendu :\n${expectedContents[file]}\n`);
      
      if (content === expectedContents[file]) {
        console.log('✅ Le contenu correspond parfaitement');
      } else {
        console.log('⚠️  Le contenu diffère de l\'attendu');
      }
    }
  } else {
    console.log(`❌ ${file} est manquant`);
    if (expectedContents[file]) {
      console.log(`💡 Contenu recommandé pour ${file}:\n${expectedContents[file]}`);
    }
  }
  console.log('--------------------------------------------\n');
});

// Vérification des dépendances critiques dans package.json
if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  const packageJson = require('./package.json');
  console.log('📦 Vérification des dépendances critiques:');
  
  const criticalDeps = {
    'process': '0.11.10',
    '@react-dnd/invariant': '4.0.0',
    'googleapis': '126.0.1'
  };

  Object.entries(criticalDeps).forEach(([dep, version]) => {
    const actualVersion = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    if (actualVersion) {
      console.log(`✅ ${dep}: ${actualVersion} (attendu: ${version})`);
    } else {
      console.log(`❌ ${dep} est manquant (attendu: ${version})`);
    }
  });
}