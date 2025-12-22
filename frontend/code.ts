// code.ts - Main Figma Plugin Logic

// ⚠️ IMPORTANT: Store your backend URL here securely
// This URL is NOT exposed in the frontend HTML
const BACKEND_API_URL = "http://localhost:5050"; // Replace with your actual backend URL

figma.showUI(__html__, { width: 500, height: 600 });

// Enhanced design data extraction
interface EnhancedNodeData {
    id: string;
    name: string;
    type: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    relativeTransform?: Transform;
    constraints?: Constraints;
    fills?: ReadonlyArray<Paint>;
    strokes?: ReadonlyArray<Paint>;
    strokeWeight?: number;
    cornerRadius?: number | PluginAPI['mixed'];
    effects?: ReadonlyArray<Effect>;
    blendMode?: BlendMode;
    layoutAlign?: LayoutAlign;
    layoutGrow?: number;
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
    itemSpacing?: number;
    children?: EnhancedNodeData[];
}

interface GeometryData {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    absoluteTransform?: Transform;
    relativeTransform?: Transform;
}

interface StylingData {
    fills?: ReadonlyArray<Paint>;
    strokes?: ReadonlyArray<Paint>;
    strokeWeight?: number;
    strokeAlign?: string;
    cornerRadius?: number | PluginAPI['mixed'];
    effects?: ReadonlyArray<Effect>;
    opacity?: number;
    blendMode?: BlendMode;
}

type LayoutAlign = 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT';
interface LayoutData {
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
    layoutAlign?: LayoutAlign;
    layoutGrow?: number;
    layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
    layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    itemSpacing?: number;
    counterAxisSpacing?: number;
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    constraints?: Constraints;
}

interface ContentData {
    text?: string;
    characters?: string;
    fontSize?: number | PluginAPI['mixed'];
    fontName?: FontName | PluginAPI['mixed'];
    fontWeight?: number;
    lineHeight?: LineHeight | PluginAPI['mixed'];
    letterSpacing?: LetterSpacing | PluginAPI['mixed'];
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
    textCase?: TextCase | PluginAPI['mixed'];
    textDecoration?: TextDecoration | PluginAPI['mixed'];
}

interface SemanticData {
    componentType?: string;
    role?: string;
    isInteractive?: boolean;
    hasStates?: boolean;
    componentCategory?: 'layout' | 'input' | 'display' | 'navigation' | 'feedback';
    accessibility?: {
        label?: string;
        role?: string;
    };
}

// Helper to clone Figma values into postMessage‑safe plain objects
function safeCloneForPostMessage(val: any): any {
    if (val === undefined || val === null) return val;
    const t = typeof val;
    if (t === 'string' || t === 'number' || t === 'boolean') return val;
    if (Array.isArray(val)) return val.map(safeCloneForPostMessage);
    if (t === 'object') {
        const out: any = {};
        for (const k in val) {
            const v = (val as any)[k];
            if (typeof v === 'function' || typeof v === 'symbol') continue;
            out[k] = safeCloneForPostMessage(v);
        }
        return out;
    }
    // Drop functions, symbols, bigint, etc.
    return undefined;
}

// New frame context / node details extraction logic
function getAllNodeDetails(node: SceneNode): EnhancedNodeData {
    return {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        relativeTransform: safeCloneForPostMessage(node.relativeTransform),
        constraints: 'constraints' in node ? safeCloneForPostMessage(node.constraints) : undefined,
        fills: 'fills' in node ? (safeCloneForPostMessage(node.fills) as ReadonlyArray<Paint>) : undefined,
        strokes: 'strokes' in node ? (safeCloneForPostMessage(node.strokes) as ReadonlyArray<Paint>) : undefined,
        strokeWeight: 'strokeWeight' in node ? (node as any).strokeWeight : undefined,
        cornerRadius: 'cornerRadius' in node ? (node as any).cornerRadius : undefined,
        effects: 'effects' in node ? (safeCloneForPostMessage((node as any).effects) as ReadonlyArray<Effect>) : undefined,
        blendMode: 'blendMode' in node ? (node as any).blendMode : undefined,
        layoutAlign: 'layoutAlign' in node ? (node as any).layoutAlign : undefined,
        layoutGrow: 'layoutGrow' in node ? (node as any).layoutGrow : undefined,
        layoutMode: 'layoutMode' in node ? (node as any).layoutMode : undefined,
        itemSpacing: 'itemSpacing' in node ? (node as any).itemSpacing : undefined,
        children: 'children' in node ? (node as any).children.map(getAllNodeDetails) : [],
    };
}

function extractGeometry(node: SceneNode): GeometryData {
    return {
        x: 'x' in node ? node.x : 0,
        y: 'y' in node ? node.y : 0,
        width: 'width' in node ? node.width : 0,
        height: 'height' in node ? node.height : 0,
        rotation: 'rotation' in node ? node.rotation : undefined,
        absoluteTransform: 'absoluteTransform' in node ? node.absoluteTransform : undefined,
        relativeTransform: 'relativeTransform' in node ? node.relativeTransform : undefined,
    };
}

function extractStyling(node: SceneNode): StylingData {
    const styling: StylingData = {};

    if ('fills' in node) styling.fills = node.fills as ReadonlyArray<Paint>;
    if ('strokes' in node) styling.strokes = node.strokes as ReadonlyArray<Paint>;
    if ('strokeWeight' in node && typeof node.strokeWeight === 'number') styling.strokeWeight = node.strokeWeight;
    if ('strokeAlign' in node) styling.strokeAlign = node.strokeAlign;
    if ('cornerRadius' in node) styling.cornerRadius = node.cornerRadius;
    if ('effects' in node) styling.effects = node.effects;
    if ('opacity' in node) styling.opacity = node.opacity;
    if ('blendMode' in node) styling.blendMode = node.blendMode;

    return styling;
}

function extractLayout(node: SceneNode): LayoutData {
    const layout: LayoutData = {};

    if ('layoutMode' in node) layout.layoutMode = node.layoutMode;
    if ('layoutAlign' in node) layout.layoutAlign = node.layoutAlign;
    if ('layoutGrow' in node) layout.layoutGrow = node.layoutGrow;
    if ('layoutSizingHorizontal' in node) layout.layoutSizingHorizontal = node.layoutSizingHorizontal;
    if ('layoutSizingVertical' in node) layout.layoutSizingVertical = node.layoutSizingVertical;
    if ('paddingTop' in node) layout.paddingTop = node.paddingTop;
    if ('paddingRight' in node) layout.paddingRight = node.paddingRight;
    if ('paddingBottom' in node) layout.paddingBottom = node.paddingBottom;
    if ('paddingLeft' in node) layout.paddingLeft = node.paddingLeft;
    if ('itemSpacing' in node) layout.itemSpacing = node.itemSpacing;
    if ('counterAxisSpacing' in node && node.counterAxisSpacing !== null) layout.counterAxisSpacing = node.counterAxisSpacing;
    if ('primaryAxisAlignItems' in node) layout.primaryAxisAlignItems = node.primaryAxisAlignItems;
    if ('counterAxisAlignItems' in node) layout.counterAxisAlignItems = node.counterAxisAlignItems;
    if ('constraints' in node) layout.constraints = node.constraints;

    return layout;
}

function extractContent(node: SceneNode): ContentData {
    const content: ContentData = {};

    if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        content.text = textNode.characters;
        content.characters = textNode.characters;
        content.fontSize = textNode.fontSize;
        content.fontName = textNode.fontName;
        if (typeof textNode.fontWeight === 'number') content.fontWeight = textNode.fontWeight;
        content.lineHeight = textNode.lineHeight;
        content.letterSpacing = textNode.letterSpacing;
        content.textAlignHorizontal = textNode.textAlignHorizontal;
        content.textAlignVertical = textNode.textAlignVertical;
        content.textCase = textNode.textCase;
        content.textDecoration = textNode.textDecoration;
    }

    return content;
}

function analyzeSemantics(node: SceneNode): SemanticData {
    const semantics: SemanticData = {};
    const nodeName = node.name.toLowerCase();

    // Detect component type based on name and structure
    if (nodeName.includes('button') || nodeName.includes('btn')) {
        semantics.componentType = 'button';
        semantics.role = 'button';
        semantics.isInteractive = true;
        semantics.componentCategory = 'input';
    } else if (nodeName.includes('input') || nodeName.includes('textfield')) {
        semantics.componentType = 'input';
        semantics.role = 'textbox';
        semantics.isInteractive = true;
        semantics.componentCategory = 'input';
    } else if (nodeName.includes('card')) {
        semantics.componentType = 'card';
        semantics.componentCategory = 'display';
    } else if (nodeName.includes('nav') || nodeName.includes('menu')) {
        semantics.componentType = 'navigation';
        semantics.componentCategory = 'navigation';
    } else if (nodeName.includes('modal') || nodeName.includes('dialog')) {
        semantics.componentType = 'modal';
        semantics.role = 'dialog';
        semantics.componentCategory = 'feedback';
    } else if (nodeName.includes('header')) {
        semantics.componentType = 'header';
        semantics.componentCategory = 'layout';
    } else if (nodeName.includes('footer')) {
        semantics.componentType = 'footer';
        semantics.componentCategory = 'layout';
    }

    // Detect interactive states
    if (nodeName.includes('hover') || nodeName.includes('active') || nodeName.includes('disabled')) {
        semantics.hasStates = true;
    }

    return semantics;
}

// Extract color palette from the design
function extractColorPalette(node: SceneNode): Record<string, string> {
    const colors: Record<string, string> = {};
    const colorMap = new Map<string, number>();

    function traverse(n: SceneNode) {
        if ('fills' in n && n.fills) {
            const fills = n.fills as ReadonlyArray<Paint>;
            fills.forEach(fill => {
                if (fill.type === 'SOLID') {
                    const rgb = fill.color;
                    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
                }
            });
        }

        if ('children' in n) {
            n.children.forEach(child => traverse(child));
        }
    }

    traverse(node);

    // Get most common colors
    const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    sortedColors.forEach((entry, idx) => {
        colors[`color-${idx + 1}`] = entry[0];
    });

    return colors;
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b]
        .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
        .join('');
}

// Extract typography system
function extractTypography(node: SceneNode): any[] {
    const fonts: any[] = [];
    const fontMap = new Map<string, any>();

    function traverse(n: SceneNode) {
        if (n.type === 'TEXT') {
            const textNode = n as TextNode;
            const fontKey = JSON.stringify(textNode.fontName);

            if (!fontMap.has(fontKey)) {
                fontMap.set(fontKey, {
                    fontFamily: textNode.fontName,
                    fontSize: textNode.fontSize,
                    fontWeight: textNode.fontWeight,
                    lineHeight: textNode.lineHeight,
                    letterSpacing: textNode.letterSpacing,
                });
            }
        }

        if ('children' in n) {
            n.children.forEach(child => traverse(child));
        }
    }

    traverse(node);
    return Array.from(fontMap.values());
}

// Message handlers
figma.ui.onmessage = async (msg) => {
    // Send API URL to UI when requested
    if (msg.type === 'get-api-url') {
        figma.ui.postMessage({
            type: 'api-url',
            url: BACKEND_API_URL,
        });
        return;
    }

    if (msg.type === 'extract-design') {
        try {
            const selection = figma.currentPage.selection;

            if (selection.length === 0) {
                figma.ui.postMessage({
                    type: 'error',
                    message: 'Please select a frame to extract design data',
                });
                return;
            }

            const selectedNode = selection[0];

            // Extract comprehensive design data using new frame context logic
            const designData = getAllNodeDetails(selectedNode);
            const colorPalette = extractColorPalette(selectedNode);
            const typography = extractTypography(selectedNode);

            // Create enhanced context
            const enhancedContext = {
                metadata: {
                    figmaFileId: figma.fileKey,
                    frameName: selectedNode.name,
                    frameId: selectedNode.id,
                    extractedAt: new Date().toISOString(),
                },
                designSystem: {
                    colors: colorPalette,
                    typography: typography,
                },
                structure: designData,
            };

            // Clone to remove any remaining non‑serializable values before postMessage
            const safeContext = safeCloneForPostMessage(enhancedContext);

            // Send to UI
            figma.ui.postMessage({
                type: 'design-extracted',
                data: safeContext,
            });

        } catch (error) {
            let message = 'Extraction failed.';
            if (error && typeof error === 'object' && 'message' in error) {
                message = `Extraction failed: ${(error as any).message}`;
            }
            figma.ui.postMessage({
                type: 'error',
                message: message
            });
        }
    }

    if (msg.type === 'close-plugin') {
        figma.closePlugin();
    }
};