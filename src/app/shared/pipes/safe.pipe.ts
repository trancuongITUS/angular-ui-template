import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';

/**
 * Sanitizes and marks values as safe for Angular's security contexts.
 *
 * @warning This pipe bypasses Angular's security. Use with caution.
 * For HTML content, the value is sanitized first to remove dangerous elements.
 * For other types (script, url, resourceUrl), the caller is responsible for validation.
 *
 * @example
 * ```html
 * <div [innerHTML]="htmlContent | safe: 'html'"></div>
 * <iframe [src]="videoUrl | safe: 'resourceUrl'"></iframe>
 * <a [href]="dynamicUrl | safe: 'url'">Link</a>
 * ```
 */
@Pipe({
    name: 'safe',
    standalone: true,
    pure: true
})
export class SafePipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer) {}

    transform(value: string, type: 'html' | 'style' | 'script' | 'url' | 'resourceUrl'): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
        if (!value) {
            return '';
        }

        switch (type) {
            case 'html':
                // Sanitize first to remove dangerous elements (scripts, onclick, etc.)
                // then trust the sanitized content
                const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, value);
                return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml || '');
            case 'style':
                // Sanitize style to remove dangerous properties (expression, url, etc.)
                const sanitizedStyle = this.sanitizer.sanitize(SecurityContext.STYLE, value);
                return this.sanitizer.bypassSecurityTrustStyle(sanitizedStyle || '');
            case 'script':
                // Scripts are dangerous - only bypass if absolutely necessary
                return this.sanitizer.bypassSecurityTrustScript(value);
            case 'url':
                // Sanitize URL to prevent javascript: protocol attacks
                const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, value);
                return this.sanitizer.bypassSecurityTrustUrl(sanitizedUrl || '');
            case 'resourceUrl':
                // Resource URLs bypass sanitization - use with extreme caution
                return this.sanitizer.bypassSecurityTrustResourceUrl(value);
            default:
                return value;
        }
    }
}
