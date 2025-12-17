// code.ts - Main Figma Plugin Logic

figma.showUI(__html__, { width: 500, height: 600 });

// Enhanced design data extraction
interface EnhancedNodeData {
    id: string;
    name: string;
    type: string;
    geometry: GeometryData;
    styling: StylingData;
    layout: LayoutData;
    content: ContentData;
    semantics: SemanticData;
    children?: EnhancedNodeData[];
}

// interface GeometryData {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     rotation?: number;
//     absoluteTransform?: Transform;
//     relativeTransform?: Transform;
// }

interface GeometryData {
    width: number;
    height: number;
    rotation?: number;
    // Removed absoluteTransform & relativeTransform (Huge token savers)
}

// interface StylingData {
//     fills?: ReadonlyArray<Paint>;
//     strokes?: ReadonlyArray<Paint>;
//     strokeWeight?: number;
//     strokeAlign?: string;
//     cornerRadius?: number | PluginAPI['mixed'];
//     effects?: ReadonlyArray<Effect>;
//     opacity?: number;
//     blendMode?: BlendMode;
// }

interface StylingData {
    fill?: string; // Simplified from ReadonlyArray<Paint>
    stroke?: string;
    strokeWeight?: number;
    radius?: number | PluginAPI['mixed'];
    shadow?: string; // Simplified Effect
    opacity?: number;
}

type LayoutAlign = 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT';
// interface LayoutData {
//     layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
//     layoutAlign?: LayoutAlign;
//     layoutGrow?: number;
//     layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
//     layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
//     paddingTop?: number;
//     paddingRight?: number;
//     paddingBottom?: number;
//     paddingLeft?: number;
//     itemSpacing?: number;
//     counterAxisSpacing?: number;
//     primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
//     counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
//     constraints?: Constraints;
// }

interface LayoutData {
    mode?: 'HORIZONTAL' | 'VERTICAL' | 'GRID';
    alignPrimary?: string;
    alignCounter?: string;
    gap?: number;
    padding?: { t: number; r: number; b: number; l: number }; // Shorthand keys
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

// Extract comprehensive node details with semantic analysis
function extractNodeData(node: SceneNode): EnhancedNodeData {
    const baseData: EnhancedNodeData = {
        id: node.id,
        name: node.name,
        type: node.type,
        geometry: extractGeometry(node),
        styling: extractStyling(node),
        layout: extractLayout(node),
        content: extractContent(node),
        semantics: analyzeSemantics(node),
    };

    // Recursively extract children
    if ('children' in node && node.children) {
        baseData.children = node.children.map(child => extractNodeData(child));
    }

    return baseData;
}

// function extractGeometry(node: SceneNode): GeometryData {
//     return {
//         x: 'x' in node ? node.x : 0,
//         y: 'y' in node ? node.y : 0,
//         width: 'width' in node ? node.width : 0,
//         height: 'height' in node ? node.height : 0,
//         rotation: 'rotation' in node ? node.rotation : undefined,
//         absoluteTransform: 'absoluteTransform' in node ? node.absoluteTransform : undefined,
//         relativeTransform: 'relativeTransform' in node ? node.relativeTransform : undefined,
//     };
// }

function extractGeometry(node: SceneNode): GeometryData {
    return {
        // Round to 2 decimals to save characters (e.g., 100.55 instead of 100.553281)
        width: 'width' in node ? Number(node.width.toFixed(2)) : 0,
        height: 'height' in node ? Number(node.height.toFixed(2)) : 0,
        rotation: 'rotation' in node && node.rotation !== 0 ? Number(node.rotation.toFixed(2)) : undefined,
    };
}

// function extractStyling(node: SceneNode): StylingData {
//     const styling: StylingData = {};

//     if ('fills' in node) styling.fills = node.fills as ReadonlyArray<Paint>;
//     if ('strokes' in node) styling.strokes = node.strokes as ReadonlyArray<Paint>;
//     if ('strokeWeight' in node && typeof node.strokeWeight === 'number') styling.strokeWeight = node.strokeWeight;
//     if ('strokeAlign' in node) styling.strokeAlign = node.strokeAlign;
//     if ('cornerRadius' in node) styling.cornerRadius = node.cornerRadius;
//     if ('effects' in node) styling.effects = node.effects;
//     if ('opacity' in node) styling.opacity = node.opacity;
//     if ('blendMode' in node) styling.blendMode = node.blendMode;

//     return styling;
// }

function extractStyling(node: SceneNode): StylingData {
    const styling: StylingData = {};

    // 1. Simplify Fills (Get the first visible solid color)
    if ('fills' in node && Array.isArray(node.fills)) {
        const solidFill = node.fills.find((paint) => paint.type === 'SOLID' && paint.visible !== false);
        if (solidFill) {
            const { r, g, b } = solidFill.color;
            const a = solidFill.opacity ?? 1;
            styling.fill = a < 1 
                ? `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`
                : rgbToHex(r, g, b);
        }
    }

    // 2. Simplify Strokes
    if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
        const solidStroke = node.strokes.find((paint) => paint.type === 'SOLID' && paint.visible !== false);
        if (solidStroke) {
            const { r, g, b } = solidStroke.color;
            styling.stroke = rgbToHex(r, g, b);
        }
        if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
            styling.strokeWeight = node.strokeWeight;
        }
    }

    // 3. Simplify Radius
    if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
        styling.radius = node.cornerRadius;
    }

    // 4. Simplify Shadows (Just grab the first drop shadow)
    if ('effects' in node && Array.isArray(node.effects)) {
        const shadow = node.effects.find((e) => e.type === 'DROP_SHADOW' && e.visible !== false);
        if (shadow) {
            styling.shadow = 'true'; // Often we just need to know if it exists for Tailwind 'shadow-md'
        }
    }

    // 5. Opacity (Only if not 1)
    if ('opacity' in node && node.opacity < 1) {
        styling.opacity = Number(node.opacity.toFixed(2));
    }

    return styling;
}

// function extractLayout(node: SceneNode): LayoutData {
//     const layout: LayoutData = {};

//     if ('layoutMode' in node) layout.layoutMode = node.layoutMode;
//     if ('layoutAlign' in node) layout.layoutAlign = node.layoutAlign;
//     if ('layoutGrow' in node) layout.layoutGrow = node.layoutGrow;
//     if ('layoutSizingHorizontal' in node) layout.layoutSizingHorizontal = node.layoutSizingHorizontal;
//     if ('layoutSizingVertical' in node) layout.layoutSizingVertical = node.layoutSizingVertical;
//     if ('paddingTop' in node) layout.paddingTop = node.paddingTop;
//     if ('paddingRight' in node) layout.paddingRight = node.paddingRight;
//     if ('paddingBottom' in node) layout.paddingBottom = node.paddingBottom;
//     if ('paddingLeft' in node) layout.paddingLeft = node.paddingLeft;
//     if ('itemSpacing' in node) layout.itemSpacing = node.itemSpacing;
//     if ('counterAxisSpacing' in node && node.counterAxisSpacing !== null) layout.counterAxisSpacing = node.counterAxisSpacing;
//     if ('primaryAxisAlignItems' in node) layout.primaryAxisAlignItems = node.primaryAxisAlignItems;
//     if ('counterAxisAlignItems' in node) layout.counterAxisAlignItems = node.counterAxisAlignItems;
//     if ('constraints' in node) layout.constraints = node.constraints;

//     return layout;
// }

function extractLayout(node: SceneNode): LayoutData {
    const layout: LayoutData = {};

    // Only extract layout props if Auto Layout is actually ON
    if ('layoutMode' in node && node.layoutMode !== 'NONE') {
        layout.mode = node.layoutMode;
        
        // Simplify alignment strings (e.g., "MIN" -> "start")
        layout.alignPrimary = node.primaryAxisAlignItems;
        layout.alignCounter = node.counterAxisAlignItems;
        
        if (node.itemSpacing > 0) layout.gap = node.itemSpacing;

        // Simplify Padding: Only add if there is actual padding
        if (node.paddingTop > 0 || node.paddingRight > 0 || node.paddingBottom > 0 || node.paddingLeft > 0) {
            layout.padding = {
                t: node.paddingTop,
                r: node.paddingRight,
                b: node.paddingBottom,
                l: node.paddingLeft
            };
        }
    }

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
    const toHex = (value: number) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
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

            // Extract comprehensive design data
            const designData = extractNodeData(selectedNode);
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

            // Send to UI
            figma.ui.postMessage({
                type: 'design-extracted',
                data: enhancedContext,
            });

        } catch (error) {
            let message = 'Extraction failed.';
            if (error && typeof error === 'object' && 'message' in error) {
                message = `Extraction failed: ${(error as any).message}`;
            }
            figma.ui.postMessage({
                type: 'error',
                message: `Extraction failed: ${(error as any).message}`
            });
        }
    }

    if (msg.type === 'close-plugin') {
        figma.closePlugin();
    }
};