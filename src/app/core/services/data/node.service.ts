import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

/**
 * Service for tree node data operations.
 * Mock data is loaded from JSON fixtures for maintainability.
 */
@Injectable({ providedIn: 'root' })
export class NodeService {
    /**
     * Gets tree nodes data from fixture file.
     */
    getTreeNodes(): Promise<TreeNode[]> {
        return import('./fixtures/tree-nodes-data.json').then((m) => m.default as TreeNode[]);
    }

    /**
     * Gets tree table nodes data from fixture file.
     */
    getTreeTableNodes(): Promise<TreeNode[]> {
        return import('./fixtures/tree-table-nodes-data.json').then((m) => m.default as TreeNode[]);
    }

    /**
     * Gets lazy loading nodes data from fixture file.
     */
    getLazyFiles(): Promise<TreeNode[]> {
        return import('./fixtures/lazy-nodes-data.json').then((m) => m.default as TreeNode[]);
    }

    /**
     * Gets filesystem nodes data from fixture file.
     */
    getFilesystem(): Promise<TreeNode[]> {
        return import('./fixtures/filesystem-nodes-data.json').then((m) => m.default as TreeNode[]);
    }

    /**
     * Alias for getTreeNodes - maintains backward compatibility.
     */
    getFiles(): Promise<TreeNode[]> {
        return this.getTreeNodes();
    }

    /**
     * Generates dynamic tree nodes programmatically.
     * @param parentCount - Number of parent nodes
     * @param childrenCount - Number of children per parent
     */
    getDynamicTreeNodes(parentCount: number, childrenCount: number): TreeNode[] {
        const nodes: TreeNode[] = [];

        for (let parentIndex = 0; parentIndex < parentCount; parentIndex++) {
            const children: TreeNode[] = [];

            for (let childIndex = 0; childIndex < childrenCount; childIndex++) {
                children.push({
                    key: `${parentIndex}-${childIndex}`,
                    label: `Child ${parentIndex}-${childIndex}`,
                    selectable: true
                });
            }

            nodes.push({
                key: parentIndex.toString(),
                label: `Parent ${parentIndex}`,
                selectable: true,
                children: children
            });
        }

        return nodes;
    }

    /**
     * Gets large tree nodes for performance testing.
     */
    getLargeTreeNodes(): Promise<TreeNode[]> {
        return Promise.resolve(this.getDynamicTreeNodes(10, 100));
    }
}
