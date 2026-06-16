import process from "process";
import {
  generateCompatibilityPost,
  selectCompatibilityPairs,
  validateCompatibilityConfig,
  loadCompatibilityConfig,
} from "./lib/zodiac-compatibility-pipeline.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { pair: null, sign: null, all: false };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--pair") options.pair = args[++index] ?? null;
    else if (arg === "--sign") options.sign = args[++index] ?? null;
    else if (arg === "--all") options.all = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  const selectors = [Boolean(options.pair), Boolean(options.sign), options.all].filter(Boolean).length;
  if (selectors !== 1) errors.push("Use exactly one selector: --pair, --sign, or --all.");

  return { options, errors };
}

function printPost(post) {
  const buttonStatus = post.keyboard.inline_keyboard.flat().every((button) => Boolean(button.url)) ? "OK" : "PROBLEMS";
  console.log("");
  console.log(`--- ${post.pairId} ---`);
  console.log(`Target            : general`);
  console.log(`Score             : ${post.score}/100`);
  console.log(`Element Dynamic   : ${post.elementDynamic}`);
  console.log(`Buttons           : ${post.keyboard.inline_keyboard.flat().length} (${buttonStatus})`);
  console.log(post.text);
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const configProblems = validateCompatibilityConfig(loadCompatibilityConfig());
  if (configProblems.length > 0) {
    configProblems.forEach((problem) => console.error(problem));
    process.exit(1);
  }

  const pairs = selectCompatibilityPairs({ pairId: options.pair, sign: options.sign, all: options.all });
  const posts = pairs.map(generateCompatibilityPost);

  console.log("=== Zodiac Compatibility Generator ===");
  console.log(`Posts             : ${posts.length}`);
  console.log(`Telegram API Calls: 0`);
  console.log(`Ledger Writes     : 0`);
  console.log("======================================");
  posts.forEach(printPost);
}

main();
