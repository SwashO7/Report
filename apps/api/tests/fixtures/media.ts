/** Minimal valid media headers. The report upload validator only inspects leading bytes. */
export const FIXTURES = {
  png: () => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, ...new Array(32).fill(0)]),
  jpeg: () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array(40).fill(0)]),
  gif: () => new Uint8Array([...Buffer.from('GIF89a'), ...new Array(40).fill(0)]),
  webp: () => new Uint8Array([...Buffer.from('RIFF'), 0, 0, 0, 0, ...Buffer.from('WEBPVP8 '), ...new Array(32).fill(0)]),
  mp4: () => new Uint8Array([0, 0, 0, 0x20, ...Buffer.from('ftypisom'), 0, 0, 2, 0, ...Buffer.from('isomiso2avc1mp41'), ...new Array(32).fill(0)]),
  webm: () => new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0x82, 0x84, ...Buffer.from('webm'), ...new Array(32).fill(0)]),
};
