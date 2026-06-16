import process from "process";
import {
  canonicalizeCompatibilityPairId,
  loadCompatibilityConfig,
  validateCompatibilityConfig,
} from "./lib/zodiac-compatibility-pipeline.mjs";
import {
  createCompatibilityRequest,
  createFastCompatibilityRequest,
  renderCompatibilityResult,
  validateCompatibilityRequest,
} from "./lib/zodiac-compatibility-request.mjs";
import { getCompatibilityButtonReport } from "./lib/zodiac-compatibility-bot.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    pair: null,
    mode: "fast",
    firstSign: null,
    secondSign: null,
    firstGender: "unspecified",
    secondGender: "unspecified",
    firstBirthDate: null,
    secondBirthDate: null,
    firstKnowsTime: false,
    secondKnowsTime: false,
    firstBirthTime: null,
    secondBirthTime: null,
    firstBirthCity: null,
    secondBirthCity: null,
    dryRun: false,
    live: false,
    approved: false,
  };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--pair") options.pair = args[++index] ?? null;
    else if (arg === "--mode") options.mode = args[++index] ?? "fast";
    else if (arg === "--first-sign") options.firstSign = args[++index] ?? null;
    else if (arg === "--second-sign") options.secondSign = args[++index] ?? null;
    else if (arg === "--first-gender") options.firstGender = args[++index] ?? "unspecified";
    else if (arg === "--second-gender") options.secondGender = args[++index] ?? "unspecified";
    else if (arg === "--first-birth-date") options.firstBirthDate = args[++index] ?? null;
    else if (arg === "--second-birth-date") options.secondBirthDate = args[++index] ?? null;
    else if (arg === "--first-birth-time") options.firstBirthTime = args[++index] ?? null;
    else if (arg === "--second-birth-time") options.secondBirthTime = args[++index] ?? null;
    else if (arg === "--first-birth-city") options.firstBirthCity = args[++index] ?? null;
    else if (arg === "--second-birth-city") options.secondBirthCity = args[++index] ?? null;
    else if (arg === "--first-knows-time") options.firstKnowsTime = true;
    else if (arg === "--second-knows-time") options.secondKnowsTime = true;
    else if (arg === "--first-unknown-time") options.firstKnowsTime = false;
    else if (arg === "--second-unknown-time") options.secondKnowsTime = false;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live) errors.push("Live compatibility channel publishing is disabled. Use the bot/Mini App flow after explicit implementation approval.");
  if (options.live && !options.approved) errors.push("Live mode requires --approved.");

  return { options, errors };
}

function requestFromOptions(options) {
  if (options.pair && (!options.firstSign || !options.secondSign)) {
    const [firstSign, secondSign] = String(options.pair).trim().toLowerCase().split("-");
    return createFastCompatibilityRequest(firstSign, secondSign);
  }

  return createCompatibilityRequest({
    source: options.mode,
    first: {
      signSlug: options.firstSign,
      gender: options.firstGender,
      birthDate: options.firstBirthDate,
      knowsBirthTime: options.firstKnowsTime,
      birthTime: options.firstBirthTime,
      birthCity: options.firstBirthCity,
    },
    second: {
      signSlug: options.secondSign,
      gender: options.secondGender,
      birthDate: options.secondBirthDate,
      knowsBirthTime: options.secondKnowsTime,
      birthTime: options.secondBirthTime,
      birthCity: options.secondBirthCity,
    },
  });
}

function printPreview({ request, result, requestedPair }) {
  const firstButton = getCompatibilityButtonReport(request.first.signSlug);
  const generalButton = getCompatibilityButtonReport("zodiac-general");
  const validation = validateCompatibilityRequest(request);

  console.log("=== Zodiac Compatibility Interactive Preview ===");
  console.log("Mode                    : DRY-RUN");
  console.log("Concept                 : interactive_bot_or_mini_app");
  console.log("Channel Feed Publishing : disabled");
  console.log("Scheduled Posts         : disabled");
  console.log(`Request Mode            : ${request.source}`);
  console.log(`Requested Pair          : ${requestedPair}`);
  console.log(`Canonical Pair          : ${result.canonicalPairId}`);
  console.log(`Input Valid             : ${validation.ok ? "YES" : "NO"}`);
  console.log(`Birth Data Persistence  : disabled`);
  console.log(`First Detected Sign     : ${request.first.signSlug}`);
  console.log(`Second Detected Sign    : ${request.second.signSlug}`);
  console.log(`First Birth Date        : ${request.first.birthDate ?? "not_used"}`);
  console.log(`Second Birth Date       : ${request.second.birthDate ?? "not_used"}`);
  console.log(`First Selected City     : ${request.first.selectedCity ? `${request.first.selectedCity.nameRu}, ${request.first.selectedCity.countryRu}` : "none"}`);
  console.log(`First City Timezone     : ${request.first.selectedCity?.timezone ?? "none"}`);
  console.log(`Second Selected City    : ${request.second.selectedCity ? `${request.second.selectedCity.nameRu}, ${request.second.selectedCity.countryRu}` : "none"}`);
  console.log(`Second City Timezone    : ${request.second.selectedCity?.timezone ?? "none"}`);
  console.log(`Unknown Birth Time Note : ${result.unknownTimeNote ? "YES" : "NO"}`);
  console.log(`Exact Time/City Note    : ${result.exactTimeCityNote ? "YES" : "NO"}`);
  console.log(`Result Signature        : ${result.resultSignature}`);
  console.log(`Total Score             : ${result.scores.total}`);
  console.log(`Attraction Score        : ${result.scores.attraction}`);
  console.log(`Communication Score     : ${result.scores.communication}`);
  console.log(`Love Score              : ${result.scores.love}`);
  console.log(`Household Score         : ${result.scores.household}`);
  if (validation.warnings.length > 0) console.log(`Warnings                : ${validation.warnings.join(" | ")}`);
  console.log(`Button Target Type      : ${firstButton.targetType}`);
  console.log(`First Sign Button       : ${firstButton.url || firstButton.previewUrl}`);
  console.log(`General Entry Link      : ${generalButton.url || generalButton.previewUrl}`);
  if (firstButton.warning) console.log(`Button Warning          : ${firstButton.warning}`);
  console.log("");
  console.log("--- Result Preview ---");
  console.log(result.text);
  console.log("");
  console.log("Telegram API Calls      : 0");
  console.log("Ledger Writes           : 0");
  console.log("==============================================");

  if (!validation.ok) {
    validation.errors.forEach((error) => console.error(error));
    process.exit(1);
  }
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const config = loadCompatibilityConfig();
  const configProblems = validateCompatibilityConfig(config);
  if (configProblems.length > 0) {
    configProblems.forEach((problem) => console.error(problem));
    process.exit(1);
  }

  const request = requestFromOptions(options);
  const result = renderCompatibilityResult(request);
  const requestedPair = options.pair || `${request.first.signSlug}-${request.second.signSlug}`;
  const canonicalPair = canonicalizeCompatibilityPairId(requestedPair, config.pairs);
  if (canonicalPair !== result.canonicalPairId) {
    throw new Error(`Canonical pair mismatch: ${canonicalPair} !== ${result.canonicalPairId}`);
  }

  printPreview({ request, result, requestedPair });
}

main();
