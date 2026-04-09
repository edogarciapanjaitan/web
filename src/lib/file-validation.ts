/**
 * File Validation Utility (Client-Side)
 *
 * Utility siap pakai untuk memvalidasi file di sisi browser
 * SEBELUM dikirim ke server.
 *
 * Contoh penggunaan di komponen React:
 *
 *   import { validateImageFile, validateDocumentFile, formatFileSize } from "@/lib/file-validation";
 *
 *   function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
 *     const file = e.target.files?.[0];
 *     if (!file) return;
 *
 *     const error = validateImageFile(file);
 *     if (error) {
 *       setError(error);
 *       e.target.value = ""; // reset input
 *       return;
 *     }
 *
 *     // File valid, lanjutkan proses upload
 *     setSelectedFile(file);
 *   }
 */

// ============================
// KONFIGURASI
// ============================

/** Ekstensi gambar yang diizinkan */
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** Ekstensi dokumen yang diizinkan */
const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".xls"];

/** MIME types gambar yang valid */
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** MIME types dokumen yang valid */
const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

/** Ukuran file maksimum: 2 MB */
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ============================
// HELPER FUNCTIONS
// ============================

/**
 * Mendapatkan ekstensi file (lowercase).
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Format ukuran file menjadi teks yang mudah dibaca.
 * Contoh: 1048576 -> "1 MB", 512000 -> "500 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

// ============================
// VALIDATION FUNCTIONS
// ============================

/**
 * Validasi file gambar (JPG, JPEG, PNG, WEBP).
 * Mengembalikan pesan error, atau null jika valid.
 *
 * @param file - File dari input
 * @param maxSize - Ukuran maks dalam bytes (default: 2MB)
 * @returns string | null - pesan error atau null jika valid
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): string | null {
  const ext = getExtension(file.name);

  // Validasi ekstensi
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return `Format file "${ext || "(tanpa ekstensi)"}" tidak didukung. Gunakan: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`;
  }

  // Validasi MIME type
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return `Tipe file "${file.type}" tidak valid untuk gambar.`;
  }

  // Validasi ukuran
  if (file.size > maxSize) {
    return `Ukuran file (${formatFileSize(file.size)}) melebihi batas maksimum ${formatFileSize(maxSize)}.`;
  }

  return null; // Valid
}

/**
 * Validasi file dokumen (PDF, CSV, XLSX, XLS).
 * Mengembalikan pesan error, atau null jika valid.
 *
 * @param file - File dari input
 * @param maxSize - Ukuran maks dalam bytes (default: 2MB)
 * @returns string | null - pesan error atau null jika valid
 */
export function validateDocumentFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): string | null {
  const ext = getExtension(file.name);

  // Validasi ekstensi
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
    return `Format file "${ext || "(tanpa ekstensi)"}" tidak didukung. Gunakan: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}`;
  }

  // Validasi MIME type
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    return `Tipe file "${file.type}" tidak valid untuk dokumen.`;
  }

  // Validasi ukuran
  if (file.size > maxSize) {
    return `Ukuran file (${formatFileSize(file.size)}) melebihi batas maksimum ${formatFileSize(maxSize)}.`;
  }

  return null; // Valid
}

/**
 * Validasi file umum (gambar ATAU dokumen).
 * Mengembalikan pesan error, atau null jika valid.
 *
 * @param file - File dari input
 * @param maxSize - Ukuran maks dalam bytes (default: 2MB)
 * @returns string | null
 */
export function validateFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): string | null {
  const ext = getExtension(file.name);
  const allExtensions = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_DOCUMENT_EXTENSIONS];
  const allMimeTypes = [...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_DOCUMENT_MIME_TYPES];

  // Validasi ekstensi
  if (!allExtensions.includes(ext)) {
    return `Format file "${ext || "(tanpa ekstensi)"}" tidak didukung. Gunakan: ${allExtensions.join(", ")}`;
  }

  // Validasi MIME type
  if (!allMimeTypes.includes(file.type)) {
    return `Tipe file "${file.type}" tidak valid.`;
  }

  // Validasi ukuran
  if (file.size > maxSize) {
    return `Ukuran file (${formatFileSize(file.size)}) melebihi batas maksimum ${formatFileSize(maxSize)}.`;
  }

  return null; // Valid
}

// ============================
// CONSTANTS EXPORT (untuk referensi)
// ============================

export {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_FILE_SIZE,
};
