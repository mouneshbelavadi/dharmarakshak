import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export interface ResolvedFontFamily {
  regularPath: string | null;
  boldPath: string | null;
  fontNameRegular: string;
  fontNameBold: string;
  supportsIndianScripts: boolean;
}

export class FontResolver {
  private static instance: FontResolver;
  private resolved: ResolvedFontFamily | null = null;

  private constructor() {}

  public static getInstance(): FontResolver {
    if (!FontResolver.instance) {
      FontResolver.instance = new FontResolver();
    }
    return FontResolver.instance;
  }

  /**
   * Resolves appropriate licensed cross-platform fonts for PDF rendering.
   * Eliminates hardcoded Windows-only assumptions by searching standard
   * cross-platform directories (Linux, macOS, Windows) and environment overrides.
   */
  public resolveFonts(): ResolvedFontFamily {
    if (this.resolved) {
      return this.resolved;
    }

    const customFontPath = process.env.DHARMARAKSHA_FONT_PATH;
    if (customFontPath && fs.existsSync(customFontPath)) {
      this.resolved = {
        regularPath: customFontPath,
        boldPath: customFontPath,
        fontNameRegular: 'DharmarakshaCustom',
        fontNameBold: 'DharmarakshaCustom',
        supportsIndianScripts: true,
      };
      return this.resolved;
    }

    // Cross-platform candidate paths
    const candidates: Array<{ regular: string; bold?: string; supportsIndian: boolean }> = [
      // Standard Linux / Docker / Cloud paths (OFL / Apache licensed Noto / DejaVu)
      {
        regular: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
        bold: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf',
        supportsIndian: true,
      },
      {
        regular: '/usr/share/fonts/opentype/noto/NotoSans-Regular.otf',
        bold: '/usr/share/fonts/opentype/noto/NotoSans-Bold.otf',
        supportsIndian: true,
      },
      {
        regular: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        supportsIndian: false,
      },
      // Windows standard paths
      {
        regular: 'C:/Windows/Fonts/segoeui.ttf',
        bold: 'C:/Windows/Fonts/segoeuib.ttf',
        supportsIndian: true,
      },
      {
        regular: 'C:/Windows/Fonts/arial.ttf',
        bold: 'C:/Windows/Fonts/arialbd.ttf',
        supportsIndian: false,
      },
      // macOS standard paths
      {
        regular: '/Library/Fonts/Arial Unicode.ttf',
        bold: '/Library/Fonts/Arial Unicode.ttf',
        supportsIndian: true,
      },
      {
        regular: '/System/Library/Fonts/Supplemental/Arial.ttf',
        bold: '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        supportsIndian: false,
      },
    ];

    for (const c of candidates) {
      if (fs.existsSync(c.regular)) {
        const hasBold = c.bold && fs.existsSync(c.bold);
        this.resolved = {
          regularPath: c.regular,
          boldPath: hasBold ? (c.bold as string) : c.regular,
          fontNameRegular: 'ResolvedRegular',
          fontNameBold: hasBold ? 'ResolvedBold' : 'ResolvedRegular',
          supportsIndianScripts: c.supportsIndian,
        };
        return this.resolved;
      }
    }

    // Portable fallback to standard built-in PDF font
    this.resolved = {
      regularPath: null,
      boldPath: null,
      fontNameRegular: 'Helvetica',
      fontNameBold: 'Helvetica-Bold',
      supportsIndianScripts: false,
    };
    return this.resolved;
  }

  /**
   * Registers resolved fonts into the PDFKit document instance.
   */
  public registerFonts(doc: typeof PDFDocument.prototype): { regular: string; bold: string } {
    const fonts = this.resolveFonts();

    if (fonts.regularPath) {
      try {
        doc.registerFont(fonts.fontNameRegular, fonts.regularPath);
        if (fonts.boldPath) {
          doc.registerFont(fonts.fontNameBold, fonts.boldPath);
        }
        return {
          regular: fonts.fontNameRegular,
          bold: fonts.fontNameBold,
        };
      } catch (err) {
        console.warn('Failed to register external font, falling back to standard Helvetica:', err);
      }
    }

    return {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
    };
  }
}

export const fontResolver = FontResolver.getInstance();
