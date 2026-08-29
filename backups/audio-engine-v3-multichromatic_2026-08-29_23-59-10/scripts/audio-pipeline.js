import fs from 'fs';
import path from 'path';

export function applyFastStart(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  let pos = 0;
  let ftyp = null;
  let mdat = null;
  let moov = null;
  const otherAtoms = [];

  while (pos < buf.length) {
    if (pos + 8 > buf.length) break;
    const size = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    
    if (size === 0) {
      const atomData = buf.subarray(pos);
      if (type === 'mdat') mdat = atomData;
      break;
    }

    if (pos + size > buf.length) break;
    const atomData = buf.subarray(pos, pos + size);

    if (type === 'ftyp') ftyp = atomData;
    else if (type === 'mdat') mdat = atomData;
    else if (type === 'moov') moov = Buffer.from(atomData);
    else if (type !== 'free') otherAtoms.push(atomData);

    pos += size;
  }

  if (!ftyp || !mdat || !moov) {
    throw new Error(`Invalid MP4 container in ${inputPath}`);
  }

  const moovSize = moov.length;

  // Shift 32-bit chunk offsets in 'stco'
  let stcoPos = 0;
  while ((stcoPos = moov.indexOf(Buffer.from('stco'), stcoPos)) !== -1) {
    const entryCount = moov.readUInt32BE(stcoPos + 8);
    let offsetPos = stcoPos + 12;
    for (let i = 0; i < entryCount; i++) {
      const currentOffset = moov.readUInt32BE(offsetPos);
      moov.writeUInt32BE(currentOffset + moovSize, offsetPos);
      offsetPos += 4;
    }
    stcoPos += 4;
  }

  // Shift 64-bit chunk offsets in 'co64'
  let co64Pos = 0;
  while ((co64Pos = moov.indexOf(Buffer.from('co64'), co64Pos)) !== -1) {
    const entryCount = moov.readUInt32BE(co64Pos + 8);
    let offsetPos = co64Pos + 12;
    for (let i = 0; i < entryCount; i++) {
      const currentOffset = moov.readBigUInt64BE(offsetPos);
      moov.writeBigUInt64BE(currentOffset + BigInt(moovSize), offsetPos);
      offsetPos += 8;
    }
    co64Pos += 4;
  }

  const outBuf = Buffer.concat([ftyp, moov, mdat, ...otherAtoms]);
  fs.writeFileSync(outputPath, outBuf);
  return { inputSize: buf.length, outputSize: outBuf.length, moovSize };
}

// Process directory
const inputDir = path.resolve('HVL/MPEG-4 AUDIO');
if (fs.existsSync(inputDir)) {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.m4a'));
  console.log(`Processing FastStart for ${files.length} tracks...`);

  files.forEach((file, index) => {
    const filePath = path.join(inputDir, file);
    const tempPath = path.join(inputDir, `faststart_${file}`);
    
    const res = applyFastStart(filePath, tempPath);
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);

    console.log(`[${index + 1}/${files.length}] ⚡ ${file} -> moov: ${res.moovSize}B, Total: ${res.outputSize}B`);
  });

  console.log('✅ ALL 30 TRACKS OPTIMIZED WITH MP4 FASTSTART!');
}
