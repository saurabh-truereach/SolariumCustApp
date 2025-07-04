#!/usr/bin/env node

/**
 * Accessibility Check Script
 * Automated accessibility testing for React Native components
 */

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
// Import configuration
const config = require('../accessibility.config.js');

/**
 * Color contrast checker (simplified version)
 */
function checkColorContrast(foreground, background, isLargeText = false) {
  // Convert hex to RGB
  const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getRelativeLuminance = rgb => {
    const {r, g, b} = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      const color = c / 255;
      return color <= 0.03928
        ? color / 12.92
        : Math.pow((color + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return {ratio: 0, passes: false, level: 'fail'};
  }

  const fgLuminance = getRelativeLuminance(fgRgb);
  const bgLuminance = getRelativeLuminance(bgRgb);

  const ratio =
    (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  // WCAG 2.1 standards
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  let level = 'fail';
  if (ratio >= aaaThreshold) {
    level = 'AAA';
  } else if (ratio >= aaThreshold) {
    level = 'AA';
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= aaThreshold,
    level,
  };
}

/**
 * Check all color combinations from config
 */
function checkColorContrasts() {
  console.log('🎨 Checking color contrast ratios...\n');

  const results = [];
  const {colorPairs} = config.colorContrast;

  colorPairs.forEach(pair => {
    const result = checkColorContrast(pair.foreground, pair.background);
    results.push({
      context: pair.context,
      foreground: pair.foreground,
      background: pair.background,
      ...result,
    });

    const status = result.passes ? '✅' : '❌';
    const ratio = result.ratio.toFixed(2);

    console.log(`${status} ${pair.context}: ${ratio}:1 (${result.level})`);
    console.log(`   ${pair.foreground} on ${pair.background}`);

    if (!result.passes) {
      const needed = pair.context.includes('large') ? 3 : 4.5;
      console.log(`   ⚠️  Needs at least ${needed}:1 ratio`);
    }
    console.log('');
  });

  return results;
}

/**
 * Run ESLint accessibility rules
 */
function runESLintA11yChecks() {
  console.log('🔍 Running ESLint accessibility checks...\n');

  try {
    const result = execSync('npx eslint src --ext .tsx,.ts --format json', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const lintResults = JSON.parse(result);
    const a11yIssues = [];

    lintResults.forEach(file => {
      file.messages.forEach(message => {
        if (
          message.ruleId &&
          (message.ruleId.includes('jsx-a11y') ||
            message.ruleId.includes('react-native-a11y'))
        ) {
          a11yIssues.push({
            file: file.filePath,
            line: message.line,
            column: message.column,
            message: message.message,
            ruleId: message.ruleId,
            severity: message.severity === 2 ? 'error' : 'warning',
          });
        }
      });
    });

    if (a11yIssues.length === 0) {
      console.log('✅ No accessibility linting issues found!\n');
    } else {
      console.log(
        `❌ Found ${a11yIssues.length} accessibility linting issues:\n`
      );

      a11yIssues.forEach(issue => {
        const severity = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(
          `${severity} ${path.relative(process.cwd(), issue.file)}:${
            issue.line
          }:${issue.column}`
        );
        console.log(`   ${issue.message} (${issue.ruleId})\n`);
      });
    }

    return a11yIssues;
  } catch (error) {
    if (error.stdout) {
      // ESLint found issues
      const lintResults = JSON.parse(error.stdout);
      const a11yIssues = [];

      lintResults.forEach(file => {
        file.messages.forEach(message => {
          if (
            message.ruleId &&
            (message.ruleId.includes('jsx-a11y') ||
              message.ruleId.includes('react-native-a11y'))
          ) {
            a11yIssues.push({
              file: file.filePath,
              line: message.line,
              column: message.column,
              message: message.message,
              ruleId: message.ruleId,
              severity: message.severity === 2 ? 'error' : 'warning',
            });
          }
        });
      });

      return a11yIssues;
    } else {
      console.error('❌ Error running ESLint:', error.message);
      return [];
    }
  }
}

/**
 * Run accessibility unit tests
 */
function runA11yTests() {
  console.log('🧪 Running accessibility unit tests...\n');

  try {
    execSync('npm test -- --testPathPattern=Accessibility --passWithNoTests', {
      stdio: 'inherit',
    });
    console.log('✅ Accessibility tests passed!\n');
    return true;
  } catch (error) {
    console.log('❌ Accessibility tests failed!\n');
    return false;
  }
}

/**
 * Check touch target sizes (simulated)
 */
function checkTouchTargets() {
  console.log('👆 Checking touch target sizes...\n');

  // This would require actual component analysis
  // For now, we'll simulate based on common patterns
  const touchableComponents = [
    {name: 'Button', width: 48, height: 48},
    {name: 'TouchableOpacity', width: 44, height: 44},
    {name: 'TextInput', width: 200, height: 48},
  ];

  const {minimumSize} = config.touchTargets;
  const issues = [];

  touchableComponents.forEach(component => {
    const tooSmall =
      component.width < minimumSize.width ||
      component.height < minimumSize.height;

    if (tooSmall) {
      issues.push({
        component: component.name,
        current: `${component.width}x${component.height}`,
        minimum: `${minimumSize.width}x${minimumSize.height}`,
      });

      console.log(
        `❌ ${component.name}: ${component.width}x${component.height}px (minimum: ${minimumSize.width}x${minimumSize.height}px)`
      );
    } else {
      console.log(
        `✅ ${component.name}: ${component.width}x${component.height}px`
      );
    }
  });

  console.log('');
  return issues;
}

/**
 * Generate accessibility report
 */
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: calculateOverallScore(results),
    criticalIssues: results.critical?.length || 0,
    warnings: results.warnings?.length || 0,
    bestPractices: results.bestPractices?.length || 0,
    contrastIssues: results.colorContrast?.filter(c => !c.passes).length || 0,
    lintIssues: results.eslint?.length || 0,
    touchTargetIssues: results.touchTargets?.length || 0,
    testsPass: results.tests || false,
    details: results,
  };

  // Generate JSON report
  fs.writeFileSync(
    'accessibility-report.json',
    JSON.stringify(report, null, 2)
  );

  // Generate HTML report
  const htmlReport = generateHTMLReport(report);
  fs.writeFileSync('accessibility-report.html', htmlReport);

  return report;
}

/**
 * Calculate overall accessibility score
 */
function calculateOverallScore(results) {
  let score = 100;

  // Deduct points for issues
  const criticalIssues = results.critical?.length || 0;
  const warnings = results.warnings?.length || 0;
  const contrastIssues =
    results.colorContrast?.filter(c => !c.passes).length || 0;

  score -= criticalIssues * 20; // 20 points per critical issue
  score -= warnings * 5; // 5 points per warning
  score -= contrastIssues * 15; // 15 points per contrast issue

  if (!results.tests) {
    score -= 10; // 10 points if tests fail
  }

  return Math.max(0, score);
}

/**
 * Generate HTML report
 */
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - Solarium Customer App</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    .header { background: #2E7D32; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .score { font-size: 2em; font-weight: bold; }
    .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .pass { color: #4CAF50; }
    .fail { color: #F44336; }
    .warning { color: #FF9800; }
    .issue { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    .timestamp { color: #666; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Accessibility Report</h1>
    <div class="score">Overall Score: ${report.overallScore}/100</div>
    <div class="timestamp">Generated: ${new Date(
      report.timestamp
    ).toLocaleString()}</div>
  </div>
  
  <div class="section">
    <h2>Summary</h2>
    <table>
      <tr><td>Critical Issues</td><td class="${
        report.criticalIssues > 0 ? 'fail' : 'pass'
      }">${report.criticalIssues}</td></tr>
      <tr><td>Warnings</td><td class="${
        report.warnings > 0 ? 'warning' : 'pass'
      }">${report.warnings}</td></tr>
      <tr><td>Color Contrast Issues</td><td class="${
        report.contrastIssues > 0 ? 'fail' : 'pass'
      }">${report.contrastIssues}</td></tr>
      <tr><td>Touch Target Issues</td><td class="${
        report.touchTargetIssues > 0 ? 'warning' : 'pass'
      }">${report.touchTargetIssues}</td></tr>
      <tr><td>Tests Pass</td><td class="${
        report.testsPass ? 'pass' : 'fail'
      }">${report.testsPass ? 'Yes' : 'No'}</td></tr>
    </table>
  </div>
  
  <div class="section">
    <h2>Color Contrast Results</h2>
    ${
      report.details.colorContrast
        ?.map(
          c => `
      <div class="issue ${c.passes ? 'pass' : 'fail'}">
        <strong>${c.context}</strong><br>
        Ratio: ${c.ratio}:1 (${c.level})<br>
        Colors: ${c.foreground} on ${c.background}
      </div>
    `
        )
        .join('') || 'No color contrast data'
    }
  </div>
  
  <div class="section">
    <h2>Recommendations</h2>
    <ul>
      ${
        report.criticalIssues > 0
          ? '<li>Fix critical accessibility issues before deployment</li>'
          : ''
      }
      ${
        report.contrastIssues > 0
          ? '<li>Improve color contrast ratios for better readability</li>'
          : ''
      }
      ${
        report.touchTargetIssues > 0
          ? '<li>Increase touch target sizes to meet minimum requirements</li>'
          : ''
      }
      ${!report.testsPass ? '<li>Fix failing accessibility tests</li>' : ''}
      ${
        report.overallScore === 100
          ? '<li>Excellent! All accessibility checks passed</li>'
          : ''
      }
    </ul>
  </div>
</body>
</html>
  `;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🌐 Starting Accessibility Checks for Solarium Customer App\n');

  const results = {};

  // Run all checks
  results.colorContrast = checkColorContrasts();
  results.eslint = runESLintA11yChecks();
  results.tests = runA11yTests();
  results.touchTargets = checkTouchTargets();

  // Generate report
  const report = generateReport(results);

  // Print summary
  console.log('📊 ACCESSIBILITY REPORT SUMMARY');
  console.log('================================');
  console.log(`Overall Score: ${report.overallScore}/100`);
  console.log(`Critical Issues: ${report.criticalIssues}`);
  console.log(`Warnings: ${report.warnings}`);
  console.log(`Color Contrast Issues: ${report.contrastIssues}`);
  console.log(`Touch Target Issues: ${report.touchTargetIssues}`);
  console.log(`Tests Pass: ${report.testsPass ? 'Yes' : 'No'}`);
  console.log('');
  console.log('📁 Reports generated:');
  console.log('   - accessibility-report.json');
  console.log('   - accessibility-report.html');
  console.log('');

  // Exit with appropriate code
  const hasFailures = report.criticalIssues > 0 || !report.testsPass;

  if (hasFailures && config.cicd.failOnCritical) {
    console.log('❌ Accessibility checks failed - see report for details');
    process.exit(1);
  } else {
    console.log('✅ Accessibility checks completed');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error running accessibility checks:', error);
    process.exit(1);
  });
}

module.exports = {
  checkColorContrast,
  runESLintA11yChecks,
  runA11yTests,
  checkTouchTargets,
  generateReport,
};
