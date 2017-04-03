const { execSync } = require('child_process');


for (let pkgManager of ['bundle', 'yarn']) {
  try {
    execSync(`${pkgManager} check`);
  } catch(e) {
    console.error(`Dependencies not met. Please run ${pkgManager} install.`);
    process.exit(1);
  }
}
