
interface ShowOpenFilePickerOptions {
    types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
    }>;
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
}

interface ShowSaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
    }>;
    excludeAcceptAllOption?: boolean;
}

declare global {
    interface Window {
        showOpenFilePicker(options?: ShowOpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
        showSaveFilePicker(options?: ShowSaveFilePickerOptions): Promise<FileSystemFileHandle>;
    }

    interface FileSystemHandle {
        kind: "file" | "directory";
        name: string;
        isSameEntry(other: FileSystemHandle): Promise<boolean>;
    }

    interface FileSystemFileHandle extends FileSystemHandle {
        kind: "file";
        getFile(): Promise<File>;
        createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
    }

    interface FileSystemCreateWritableOptions {
        keepExistingData?: boolean;
    }

    interface FileSystemWritableFileStream extends WritableStream {
        write(data: string | BufferSource | Blob): Promise<void>;
        seek(position: number): Promise<void>;
        truncate(size: number): Promise<void>;
    }

    interface DataTransferItem {
        getAsFileSystemHandle(): Promise<FileSystemHandle | null>;
    }
}
