import { BasePlugin, PluginRegistry } from '@embedpdf/core';
import { SelectionAction } from './actions';
import { SelectionCapability, SelectionPluginConfig, SelectionState, RegisterSelectionOnPageOptions, RegisterMarqueeOnPageOptions, SelectionMenuPlacement } from './types';
export declare class SelectionPlugin extends BasePlugin<SelectionPluginConfig, SelectionCapability, SelectionState, SelectionAction> {
    static readonly id: "selection";
    /** Modes that should trigger text-selection logic, per document (mode -> config) */
    private enabledModesPerDoc;
    private selecting;
    private anchor;
    /** Whether the text handler has a pending anchor (before drag threshold is met) */
    private hasTextAnchor;
    /** Tracks the page a marquee drag started on, per document */
    private marqueePage;
    /** Page callbacks for rect updates, per document */
    private pageCallbacks;
    /** LRU access order for geometry cache, per document (oldest first) */
    private geoAccessOrder;
    private readonly menuPlacement$;
    private readonly selChange$;
    private readonly textRetrieved$;
    private readonly copyToClipboard$;
    private readonly beginSelection$;
    private readonly endSelection$;
    private readonly marqueeChange$;
    private readonly marqueeEnd$;
    private readonly emptySpaceClick$;
    private interactionManagerCapability;
    private viewportCapability;
    private scrollCapability;
    private readonly menuHeight;
    private readonly config;
    constructor(id: string, registry: PluginRegistry, config: SelectionPluginConfig);
    protected onDocumentLoadingStarted(documentId: string): void;
    protected onDocumentClosed(documentId: string): void;
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    buildCapability(): SelectionCapability;
    private createSelectionScope;
    private getDocumentState;
    /**
     * Subscribe to menu placement changes for a specific document
     * @param documentId - The document ID to subscribe to
     * @param listener - Callback function that receives placement updates
     * @returns Unsubscribe function
     */
    onMenuPlacement(documentId: string, listener: (placement: SelectionMenuPlacement | null) => void): import('@embedpdf/core').Unsubscribe;
    /**
     * Register text selection on a page. Uses `registerAlways` so any plugin
     * can enable text selection for their mode via `enableForMode()`.
     */
    registerSelectionOnPage(opts: RegisterSelectionOnPageOptions): () => void;
    /**
     * Register marquee selection on a page. Uses `registerAlways` so any plugin
     * can enable marquee selection for their mode via `enableForMode({ enableMarquee: true })`.
     */
    registerMarqueeOnPage(opts: RegisterMarqueeOnPageOptions): () => void;
    /**
     * Helper to calculate viewport relative metrics for a page rect.
     * Returns null if the rect cannot be converted to viewport space.
     */
    private getPlacementMetrics;
    private emitMenuPlacement;
    private recalculateMenuPlacement;
    private notifyPage;
    private notifyAllPages;
    private getNewPageGeometryAndCache;
    private getOrLoadGeometry;
    private touchGeometry;
    private evictGeometryIfNeeded;
    private beginSelection;
    private endSelection;
    private clearSelection;
    private selectWord;
    private selectLine;
    /**
     * Set a selection range without going through the drag begin/update/end flow.
     * Used by double-click (word) and triple-click (line) selection.
     */
    private applyInstantSelection;
    private updateSelection;
    private updateRectsAndSlices;
    private getSelectedText;
    private copyToClipboard;
    private beginMarquee;
    private updateMarquee;
    private endMarquee;
    private cancelMarquee;
    /** @deprecated — shim for backward compat; delegates to pointerMode config */
    private setMarqueeEnabled;
    /** @deprecated — shim for backward compat; reads pointerMode config */
    private isMarqueeEnabled;
}
