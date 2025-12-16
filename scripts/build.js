#!/usr/bin/env node

/**
 * Build System for Cross-Provider Design Skills & Commands
 *
 * Transforms feature-rich source files into provider-specific formats:
 * - Cursor: Downgraded (no frontmatter/args)
 * - Claude Code: Full featured (frontmatter + body)
 * - Gemini: Full featured (TOML + modular skills)
 * - Codex: Full featured (custom prompts + modular skills)
 *
 * Also builds Tailwind CSS for production deployment.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readSourceFiles, readPatterns } from './lib/utils.js';
import {
  transformCursor,
  transformClaudeCode,
  transformGemini,
  transformCodex
} from './lib/transformers/index.js';
import { createAllZips } from './lib/zip.js';
import { execSync } from 'child_process';

/**
 * Copy directory recursively
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

/**
 * Build Tailwind CSS for production
 */
function buildTailwindCSS() {
  const inputFile = path.join(ROOT_DIR, 'public', 'css', 'main.css');
  const outputFile = path.join(ROOT_DIR, 'public', 'css', 'styles.css');

  console.log('🎨 Building Tailwind CSS...');
  try {
    execSync(`bunx @tailwindcss/cli -i "${inputFile}" -o "${outputFile}" --minify`, {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
    console.log('✓ Tailwind CSS compiled to public/css/styles.css\n');
  } catch (error) {
    console.error('Failed to build Tailwind CSS:', error.message);
    process.exit(1);
  }
}

/**
 * Build frontend JavaScript bundle using Bun's bundler
 */
async function buildFrontendJS() {
  const entrypoint = path.join(ROOT_DIR, 'public', 'app.js');
  const outdir = path.join(ROOT_DIR, 'public', 'dist');

  console.log('📦 Bundling frontend JavaScript...');

  try {
    const result = await Bun.build({
      entrypoints: [entrypoint],
      outdir: outdir,
      target: 'browser',
      format: 'esm',
      minify: true,
      sourcemap: 'linked',
      naming: '[name].bundle.[ext]',
    });

    if (!result.success) {
      console.error('Bundle failed:');
      for (const log of result.logs) {
        console.error(log);
      }
      process.exit(1);
    }

    // Find the main bundle output
    const mainBundle = result.outputs.find(o => o.kind === 'entry-point');
    if (mainBundle) {
      const bundleName = path.basename(mainBundle.path);
      const bundleSize = (mainBundle.size / 1024).toFixed(1);
      console.log(`✓ Frontend JS bundled to public/dist/${bundleName} (${bundleSize} KB)\n`);
    }

    return result;
  } catch (error) {
    console.error('Failed to bundle frontend JS:', error.message);
    process.exit(1);
  }
}

/**
 * Main build process
 */
async function build() {
  console.log('🔨 Building cross-provider design plugins...\n');

  // Build frontend assets
  buildTailwindCSS();
  await buildFrontendJS();

  // Read source files
  const { commands, skills } = readSourceFiles(ROOT_DIR);
  const patterns = readPatterns(ROOT_DIR);
  console.log(`📖 Read ${commands.length} commands, ${skills.length} skills, and ${patterns.patterns.length + patterns.antipatterns.length} pattern categories\n`);

  // Transform for each provider
  transformCursor(commands, skills, DIST_DIR, patterns);
  transformClaudeCode(commands, skills, DIST_DIR, patterns);
  transformGemini(commands, skills, DIST_DIR, patterns);
  transformCodex(commands, skills, DIST_DIR, patterns);
  
  // Create ZIP bundles
  await createAllZips(DIST_DIR);

  // Copy Claude Code output to project's .claude directory for local development
  const claudeCodeSrc = path.join(DIST_DIR, 'claude-code', '.claude');
  const claudeCodeDest = path.join(ROOT_DIR, '.claude');

  // Copy commands and skills directories (preserves other files like settings.local.json)
  const commandsSrc = path.join(claudeCodeSrc, 'commands');
  const skillsSrc = path.join(claudeCodeSrc, 'skills');
  const commandsDest = path.join(claudeCodeDest, 'commands');
  const skillsDest = path.join(claudeCodeDest, 'skills');

  // Remove existing and copy fresh
  if (fs.existsSync(commandsDest)) fs.rmSync(commandsDest, { recursive: true });
  if (fs.existsSync(skillsDest)) fs.rmSync(skillsDest, { recursive: true });

  copyDirSync(commandsSrc, commandsDest);
  copyDirSync(skillsSrc, skillsDest);

  console.log(`📋 Synced to .claude/: commands + skills`);

  console.log('\n✨ Build complete!');
}

// Run the build
build();
