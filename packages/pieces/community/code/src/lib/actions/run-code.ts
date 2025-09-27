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
      defaultValue: `// Write your JavaScript code here
// You can access previous step data through the context

const result = {
  message: 'Hello from Code piece!',
  timestamp: new Date().toISOString()
};

return result;`,
    }),
  },
  async run(ctx) {
    const { code: userCode } = ctx.propsValue;

    try {
      // Create a function from the user's code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const codeFunction = new AsyncFunction(userCode);

      // Execute the code
      const result = await codeFunction();

      return result;
    } catch (error: any) {
      throw new Error(`Code execution error: ${error.message}`);
    }
  },
});