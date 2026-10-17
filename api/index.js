import { handle } from '../lib/api.js';

// Every /api/* request is routed here by vercel.json, so the whole API is one function.
export default function handler(req, res) {
  return handle(req, res);
}
