import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
if (!configPath) throw new Error("tsconfig.json was not found");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();
const viewLike = new Set([
  "View",
  "Pressable",
  "ScrollView",
  "SafeAreaView",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableWithoutFeedback",
  "Page",
  "ChipRow",
]);
const failures = [];

function lineOf(source, node) {
  const position = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${path.relative(root, source.fileName)}:${position.line + 1}`;
}

function tagName(element) {
  const opening = ts.isJsxElement(element) ? element.openingElement : element;
  return opening.tagName.getText();
}

function canYieldRawText(expression) {
  const type = checker.getTypeAtLocation(expression);
  if (type.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike))
    return true;
  return (
    type.isUnion?.() &&
    type.types.some(
      (part) =>
        part.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike),
    )
  );
}

function inspect(source, node) {
  if (ts.isJsxElement(node) && viewLike.has(tagName(node))) {
    for (const child of node.children) {
      if (ts.isJsxText(child) && child.getText().trim())
        failures.push(
          `${lineOf(source, child)} raw JSX text under <${tagName(node)}>`,
        );
      if (
        ts.isJsxExpression(child) &&
        child.expression &&
        ts.isBinaryExpression(child.expression) &&
        child.expression.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken &&
        canYieldRawText(child.expression.left)
      )
        failures.push(
          `${lineOf(source, child)} && condition can yield text under <${tagName(node)}>; coerce it with Boolean()`,
        );
    }
  }
  ts.forEachChild(node, (child) => inspect(source, child));
}

for (const source of program.getSourceFiles()) {
  if (
    source.fileName.includes(`${path.sep}src${path.sep}`) &&
    source.fileName.endsWith(".tsx") &&
    !source.isDeclarationFile
  )
    inspect(source, source);
}

if (failures.length) {
  console.error(
    "Unsafe React Native text children found:\n" + failures.join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log("React Native JSX text-node audit passed.");
}
