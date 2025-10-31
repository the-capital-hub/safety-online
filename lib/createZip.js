const CRC_TABLE = (() => {
        const table = new Uint32Array(256);
        for (let i = 0; i < 256; i += 1) {
                let crc = i;
                for (let j = 0; j < 8; j += 1) {
                        if ((crc & 1) !== 0) {
                                crc = (crc >>> 1) ^ 0xedb88320;
                        } else {
                                crc >>>= 1;
                        }
                }
                table[i] = crc >>> 0;
        }
        return table;
})();

const calculateCrc32 = (data) => {
        let crc = 0 ^ -1;
        for (let i = 0; i < data.length; i += 1) {
                crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
        }
        return (crc ^ -1) >>> 0;
};

const writeUint16LE = (view, offset, value) => {
        view.setUint16(offset, value & 0xffff, true);
};

const writeUint32LE = (view, offset, value) => {
        view.setUint32(offset, value >>> 0, true);
};

const normaliseDate = (input) => {
        if (!input && input !== 0) {
                return new Date();
        }

        const candidate =
                input instanceof Date
                        ? input
                        : typeof input === "number"
                        ? new Date(input)
                        : new Date(input);

        if (Number.isNaN(candidate.getTime()) || candidate.getUTCFullYear() < 1980) {
                return new Date();
        }

        return candidate;
};

const getDosDateTime = (input) => {
        const safeDate = normaliseDate(input);
        const year = safeDate.getUTCFullYear();
        const month = safeDate.getUTCMonth() + 1;
        const day = safeDate.getUTCDate();
        const hours = safeDate.getUTCHours();
        const minutes = safeDate.getUTCMinutes();
        const seconds = Math.floor(safeDate.getUTCSeconds() / 2);

        const dosDate =
                ((year - 1980) << 9) | (month << 5) | day;
        const dosTime = (hours << 11) | (minutes << 5) | seconds;
        return { dosDate, dosTime };
};

export const createZipBlob = async (files) => {
        if (!Array.isArray(files)) {
                throw new Error("Files must be provided as an array");
        }

        const encoder = new TextEncoder();
        const chunks = [];
        const centralDirectoryEntries = [];
        let offset = 0;

        for (const file of files) {
                if (!file || !file.name || !file.data) {
                        throw new Error("Each file must include a name and data");
                }

                const nameBytes = encoder.encode(file.name);
                const arrayBuffer =
                        file.data instanceof Uint8Array
                                ? file.data
                                : new Uint8Array(file.data);
                const crc32 = calculateCrc32(arrayBuffer);
                const size = arrayBuffer.length;
                const { dosDate, dosTime } = getDosDateTime(file.lastModified);

                const localHeader = new Uint8Array(30 + nameBytes.length);
                const localHeaderView = new DataView(localHeader.buffer);
                writeUint32LE(localHeaderView, 0, 0x04034b50);
                writeUint16LE(localHeaderView, 4, 20);
                writeUint16LE(localHeaderView, 6, 0);
                writeUint16LE(localHeaderView, 8, 0);
                writeUint16LE(localHeaderView, 10, dosTime);
                writeUint16LE(localHeaderView, 12, dosDate);
                writeUint32LE(localHeaderView, 14, crc32);
                writeUint32LE(localHeaderView, 18, size);
                writeUint32LE(localHeaderView, 22, size);
                writeUint16LE(localHeaderView, 26, nameBytes.length);
                writeUint16LE(localHeaderView, 28, 0);
                localHeader.set(nameBytes, 30);

                chunks.push(localHeader, arrayBuffer);

                const centralHeader = new Uint8Array(46 + nameBytes.length);
                const centralHeaderView = new DataView(centralHeader.buffer);
                writeUint32LE(centralHeaderView, 0, 0x02014b50);
                writeUint16LE(centralHeaderView, 4, 20);
                writeUint16LE(centralHeaderView, 6, 20);
                writeUint16LE(centralHeaderView, 8, 0);
                writeUint16LE(centralHeaderView, 10, 0);
                writeUint16LE(centralHeaderView, 12, dosTime);
                writeUint16LE(centralHeaderView, 14, dosDate);
                writeUint32LE(centralHeaderView, 16, crc32);
                writeUint32LE(centralHeaderView, 20, size);
                writeUint32LE(centralHeaderView, 24, size);
                writeUint16LE(centralHeaderView, 28, nameBytes.length);
                writeUint16LE(centralHeaderView, 30, 0);
                writeUint16LE(centralHeaderView, 32, 0);
                writeUint16LE(centralHeaderView, 34, 0);
                writeUint16LE(centralHeaderView, 36, 0);
                writeUint32LE(centralHeaderView, 38, 0);
                writeUint32LE(centralHeaderView, 42, offset);
                centralHeader.set(nameBytes, 46);

                centralDirectoryEntries.push(centralHeader);

                offset += localHeader.length + arrayBuffer.length;
        }

        const centralDirectoryOffset = offset;
        for (const entry of centralDirectoryEntries) {
                chunks.push(entry);
                offset += entry.length;
        }

        const endOfCentralDir = new Uint8Array(22);
        const endView = new DataView(endOfCentralDir.buffer);
        writeUint32LE(endView, 0, 0x06054b50);
        writeUint16LE(endView, 4, 0);
        writeUint16LE(endView, 6, 0);
        writeUint16LE(endView, 8, centralDirectoryEntries.length);
        writeUint16LE(endView, 10, centralDirectoryEntries.length);

        const centralDirectorySize = offset - centralDirectoryOffset;
        writeUint32LE(endView, 12, centralDirectorySize);
        writeUint32LE(endView, 16, centralDirectoryOffset);
        writeUint16LE(endView, 20, 0);

        chunks.push(endOfCentralDir);

        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const zipBuffer = new Uint8Array(totalSize);
        let cursor = 0;
        for (const chunk of chunks) {
                zipBuffer.set(chunk, cursor);
                cursor += chunk.length;
        }

        return new Blob([zipBuffer], { type: "application/zip" });
};

export default createZipBlob;
