import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { runCode } from './lib/actions/run-code';

export const code = createPiece({
  displayName: 'Code',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.20.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/code.svg',
  categories: [],
  description: 'Run custom JavaScript code',
  authors: ['activepieces'],
  actions: [runCode],
  triggers: [],
});