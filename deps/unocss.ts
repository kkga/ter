// https://github.com/denoland/deno/issues/19096
import transformerVariantGroupImport from "npm:@unocss/transformer-variant-group@0.58.3";
import transformerDirectivesImport from "npm:@unocss/transformer-directives@0.58.3";
import presetWebFontsImport from "npm:@unocss/preset-web-fonts@0.58.3";

export {
  createGenerator,
  type SourceCodeTransformer,
  type UnocssPluginContext,
  type UserConfig,
} from "npm:@unocss/core@0.58.3";
export { presetUno } from "npm:@unocss/preset-uno@0.58.3";
export { presetTypography } from "npm:@unocss/preset-typography@0.58.3";

// export { default as MagicString } from "npm:magic-string@0.30.5";

// https://github.com/denoland/deno/issues/16458#issuecomment-1295003089
export const transformerVariantGroup =
  transformerVariantGroupImport as unknown as typeof transformerDirectivesImport.default;
export const transformerDirectives =
  transformerDirectivesImport as unknown as typeof transformerDirectivesImport.default;
export const presetWebFonts =
  presetWebFontsImport as unknown as typeof presetWebFontsImport.default;

export const normalize = `
*,::after,::before{box-sizing:border-box}html{font-family:system-ui,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji';line-height:1.15;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4}body{margin:0}hr{height:0;color:inherit}abbr[title]{text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}::-moz-focus-inner{border-style:none;padding:0}:-moz-focusring{outline:1px dotted ButtonText}:-moz-ui-invalid{box-shadow:none}legend{padding:0}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}`;
