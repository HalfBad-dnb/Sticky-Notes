import { TextEncoder, TextDecoder } from 'util';

// Make TextEncoder and TextDecoder available in the global scope for Jest tests
window.TextEncoder = TextEncoder;
window.TextDecoder = TextDecoder;
