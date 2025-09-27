import { createAction, Property } from '@activepieces/pieces-framework';

export const runCode = createAction({
  name: 'run-code',
  displayName: 'Run JavaScript Code',
  description: 'Execute custom JavaScript code',
  props: {
    code: Property.LongText({
      displayName: 'Code',
      description: 'JavaScript code to execute',
      required: true,
      defaultValue: `export const code = async (inputs) => {
  // inputs contains all data from previous steps
  console.log('Previous step data:', inputs);

  // Your code here
  const result = {
    message: 'Hello from Code piece!',
    timestamp: new Date().toISOString(),
    data: inputs
  };

  // Return your output
  return result;
};`,
    }),
    inputs: Property.Json({
      displayName: 'Input Data',
      description: 'Data to pass to the code',
      required: false,
      defaultValue: {},
    }),
  },
  async run(context) {
    const { code: userCode, inputs } = context.propsValue;

    try {
      // Create a function from the user's code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const codeFunction = new AsyncFunction('inputs', 'require', 'console', userCode + '\n return code(inputs);');

      // Create a safe console object
      const safeConsole = {
        log: (...args: any[]) => console.log('[User Code]', ...args),
        error: (...args: any[]) => console.error('[User Code]', ...args),
        warn: (...args: any[]) => console.warn('[User Code]', ...args),
        info: (...args: any[]) => console.info('[User Code]', ...args),
      };

      // Execute the code
      const result = await codeFunction(inputs || {}, require, safeConsole);

      return {
        success: true,
        output: result
      };
    } catch (error: any) {
      console.error('Code execution error:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  },
});