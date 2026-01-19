import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Default highlight color (yellow) */
const DEFAULT_HIGHLIGHT_COLOR = '#ffeb3b';

/** Regex patterns for valid CSS color values */
const COLOR_PATTERNS = {
    hex: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    rgb: /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
    rgba: /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/,
    namedColor: /^[a-zA-Z]+$/
};

/** List of valid CSS named colors */
const VALID_NAMED_COLORS = new Set([
    'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
    'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua',
    'orange', 'aliceblue', 'antiquewhite', 'aquamarine', 'azure', 'beige',
    'bisque', 'blanchedalmond', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
    'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson',
    'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
    'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid',
    'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
    'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
    'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'gainsboro',
    'ghostwhite', 'gold', 'goldenrod', 'greenyellow', 'honeydew', 'hotpink',
    'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush',
    'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
    'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightpink', 'lightsalmon',
    'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue',
    'lightyellow', 'limegreen', 'linen', 'magenta', 'mediumaquamarine',
    'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
    'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
    'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite',
    'oldlace', 'olivedrab', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
    'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink',
    'plum', 'powderblue', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon',
    'sandybrown', 'seagreen', 'seashell', 'sienna', 'skyblue', 'slateblue',
    'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'thistle', 'tomato',
    'turquoise', 'violet', 'wheat', 'whitesmoke', 'yellowgreen', 'transparent'
]);

/**
 * Highlights search terms in text with HTML markup.
 * Validates color input to prevent XSS attacks.
 *
 * @example
 * ```html
 * <div [innerHTML]="text | highlight: searchTerm"></div>
 * <div [innerHTML]="text | highlight: searchTerm: 'yellow'"></div>
 * <div [innerHTML]="text | highlight: searchTerm: '#ff0000'"></div>
 * ```
 *
 * @note Returns SafeHtml, use with [innerHTML] binding
 */
@Pipe({
    name: 'highlight',
    standalone: true,
    pure: true
})
export class HighlightPipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer) {}

    transform(value: string, searchTerm: string, highlightColor: string = DEFAULT_HIGHLIGHT_COLOR): SafeHtml {
        if (!value || !searchTerm) {
            return value || '';
        }

        // Validate and sanitize color input
        const safeColor = this.validateColor(highlightColor);

        // Escape HTML entities in original value to prevent XSS
        const escapedValue = this.escapeHtml(value);

        const term = this.escapeRegex(searchTerm);
        const regex = new RegExp(term, 'gi');

        const highlighted = escapedValue.replace(
            regex,
            (match) => `<mark style="background-color: ${safeColor}; padding: 0 2px;">${match}</mark>`
        );

        // Sanitize the final HTML output
        const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, highlighted);
        return this.sanitizer.bypassSecurityTrustHtml(sanitized || '');
    }

    /** Validates color input and returns safe color or default */
    private validateColor(color: string): string {
        if (!color) {
            return DEFAULT_HIGHLIGHT_COLOR;
        }

        const trimmed = color.trim().toLowerCase();

        // Check hex color
        if (COLOR_PATTERNS.hex.test(trimmed)) {
            return trimmed;
        }

        // Check rgb/rgba
        if (COLOR_PATTERNS.rgb.test(trimmed) || COLOR_PATTERNS.rgba.test(trimmed)) {
            return trimmed;
        }

        // Check named color
        if (COLOR_PATTERNS.namedColor.test(trimmed) && VALID_NAMED_COLORS.has(trimmed)) {
            return trimmed;
        }

        // Invalid color - return default
        return DEFAULT_HIGHLIGHT_COLOR;
    }

    /** Escapes special regex characters */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /** Escapes HTML entities to prevent XSS */
    private escapeHtml(str: string): string {
        const htmlEscapes: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
    }
}
