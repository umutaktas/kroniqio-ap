import { createAction, Property } from '@activepieces/pieces-framework';

export const runCode = createAction({
  name: 'run-code',
  displayName: 'Run Code',
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
  },
  async run(context) {
    const { code: userCode } = context.propsValue;

    // Get all previous step data
    const inputs = context.run.steps;

    try {
      // Create a function from the user's code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const codeFunction = new AsyncFunction('inputs', userCode + '\n return code(inputs);');

      // Execute the code with previous step data
      const result = await codeFunction(inputs);

      return result;
    } catch (error: any) {
      throw new Error(`Code execution error: ${error.message}`);
    }
  },
});