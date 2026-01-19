import { Pipe, PipeTransform } from '@angular/core';

/**
 * Filters an array based on a search term or predicate function.
 * This is a pure pipe - it only re-runs when input reference changes.
 *
 * @example
 * ```html
 * <div *ngFor="let user of users | filter: searchTerm: 'name'">
 *   {{ user.name }}
 * </div>
 * ```
 *
 * @note For the pipe to detect changes, ensure array is replaced (not mutated):
 * - Instead of: `this.items.push(newItem);`
 * - Use: `this.items = [...this.items, newItem];`
 */
@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {
    transform<T>(items: T[], searchTerm: string | ((item: T) => boolean), property?: keyof T): T[] {
        if (!items || !searchTerm) {
            return items;
        }

        // Function predicate
        if (typeof searchTerm === 'function') {
            return items.filter(searchTerm);
        }

        // String search
        const term = searchTerm.toLowerCase().trim();

        return items.filter((item) => {
            if (property) {
                const value = item[property];
                return this.matchesSearchTerm(value, term);
            }

            // Search all properties
            return Object.values(item as object).some((value) => this.matchesSearchTerm(value, term));
        });
    }

    private matchesSearchTerm(value: unknown, term: string): boolean {
        if (value === null || value === undefined) {
            return false;
        }
        return String(value).toLowerCase().includes(term);
    }
}
