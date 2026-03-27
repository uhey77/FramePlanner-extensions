import * as fs from "fs/promises";
import * as path from "path";

import Mocha from "mocha";

export async function run(): Promise<void> {
  const mocha = new Mocha({
    color: true,
    timeout: 20_000,
    ui: "tdd"
  });

  const testsRoot = __dirname;
  const testFiles = await collectTestFiles(testsRoot);

  for (const file of testFiles) {
    if (file.endsWith(".test.js")) {
      mocha.addFile(file);
    }
  }

  await new Promise<void>((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} integration test(s) failed.`));
        return;
      }

      resolve();
    });
  });
}

async function collectTestFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectTestFiles(fullPath);
      }

      return [fullPath];
    })
  );

  return files.flat();
}
