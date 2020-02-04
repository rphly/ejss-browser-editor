const EDITABLE_VARIABLES_REGEX = `([a-zA-Z0-9]+\\s=\\s"?'?)(.*?)("?'?;\\s\/\/\\sEjsS\\sModel.Variables\\.EditableVariable\\.)(\\S+)`;
const EDITABLE_FUNCTIONS_REGEX = `function ([a-zA-Z]+)( \\(\\) {  \\/\\/ > CustomCode\\.EditableFunction:[0-9]+\\n)((?:\\s+.*?)*)(})`;

export { EDITABLE_VARIABLES_REGEX, EDITABLE_FUNCTIONS_REGEX };
