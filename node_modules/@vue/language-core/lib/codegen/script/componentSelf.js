"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComponentSelf = generateComponentSelf;
const shared_1 = require("@vue/shared");
const path = require("path-browserify");
const codeFeatures_1 = require("../codeFeatures");
const utils_1 = require("../utils");
const component_1 = require("./component");
function* generateComponentSelf(options, ctx, templateCodegenCtx) {
    if (options.sfc.scriptSetup && options.scriptSetupRanges) {
        yield `const __VLS_self = (await import('${options.vueCompilerOptions.lib}')).defineComponent({${utils_1.newLine}`;
        yield `setup: () => ({${utils_1.newLine}`;
        if (ctx.bypassDefineComponent) {
            for (const code of (0, component_1.generateComponentSetupReturns)(options.scriptSetupRanges)) {
                yield `...${code},${utils_1.newLine}`;
            }
        }
        // bindings
        const templateUsageVars = new Set([
            ...options.sfc.template?.ast?.components.flatMap(c => [(0, shared_1.camelize)(c), (0, shared_1.capitalize)((0, shared_1.camelize)(c))]) ?? [],
            ...options.templateCodegen?.accessExternalVariables.keys() ?? [],
            ...templateCodegenCtx.accessExternalVariables.keys(),
        ]);
        for (const varName of ctx.bindingNames) {
            if (!templateUsageVars.has(varName)) {
                continue;
            }
            const token = Symbol(varName.length);
            yield ['', undefined, 0, { __linkedToken: token }];
            yield `${varName}: ${varName} as typeof `;
            yield ['', undefined, 0, { __linkedToken: token }];
            yield `${varName},${utils_1.newLine}`;
        }
        yield `}),${utils_1.newLine}`;
        if (!ctx.bypassDefineComponent) {
            const emitOptionCodes = [...(0, component_1.generateEmitsOption)(options, options.scriptSetupRanges)];
            yield* emitOptionCodes;
            yield* (0, component_1.generatePropsOption)(options, ctx, options.sfc.scriptSetup, options.scriptSetupRanges, !!emitOptionCodes.length, false);
        }
        if (options.sfc.script && options.scriptRanges?.exportDefault?.args) {
            const { args } = options.scriptRanges.exportDefault;
            yield (0, utils_1.generateSfcBlockSection)(options.sfc.script, args.start + 1, args.end - 1, codeFeatures_1.codeFeatures.all);
        }
        yield `})${utils_1.endOfLine}`; // defineComponent {
    }
    else if (options.sfc.script) {
        yield `let __VLS_self!: typeof import('./${path.basename(options.fileName)}').default${utils_1.endOfLine}`;
    }
    else {
        yield `const __VLS_self = (await import('${options.vueCompilerOptions.lib}')).defineComponent({})${utils_1.endOfLine}`;
    }
}
//# sourceMappingURL=componentSelf.js.map