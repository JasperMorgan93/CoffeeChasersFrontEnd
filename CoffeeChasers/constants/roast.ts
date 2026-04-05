import { COLORS } from './colors';

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
};

const hexToRgb = (hex: string) => {
    const sanitized = hex.replace('#', '');
    const parsed = Number.parseInt(sanitized, 16);

    return {
        r: (parsed >> 16) & 255,
        g: (parsed >> 8) & 255,
        b: parsed & 255,
    };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) => {
    const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHex = (from: string, to: string, progress: number) => {
    const p = clamp(progress, 0, 1);
    const fromRgb = hexToRgb(from);
    const toRgb = hexToRgb(to);

    return rgbToHex({
        r: Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * p),
        g: Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * p),
        b: Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * p),
    });
};

export const roastProgressFromStep = (step: number, totalSteps = 10) => {
    const maxStep = Math.max(1, totalSteps) - 1;
    if (maxStep <= 0) {
        return 0;
    }

    return clamp(step / maxStep, 0, 1);
};

export const roastProgressFromRating = (rating: number, maxRating = 5, minRating = 0) => {
    if (!Number.isFinite(rating)) {
        return 0;
    }

    const span = maxRating - minRating;
    if (span <= 0) {
        return 0;
    }

    return clamp((rating - minRating) / span, 0, 1);
};

export const getRoastBeanColors = (progress: number) => {
    const p = clamp(progress, 0, 1);

    return {
        outer: mixHex(COLORS.roastOuterLight, COLORS.roastOuterDark, p),
        inner: mixHex(COLORS.roastInnerLight, COLORS.roastInnerDark, p),
        crease: mixHex(COLORS.roastCreaseLight, COLORS.roastCreaseDark, p),
        border: mixHex(COLORS.roastBorderLight, COLORS.roastBorderDark, p),
        shine: `rgba(255, 224, 186, ${0.34 - p * 0.16})`,
    };
};

export const getRoastMarkerColors = (progress: number) => {
    const bean = getRoastBeanColors(progress);

    return {
        background: bean.inner,
        border: bean.border,
        text: progress > 0.6 ? COLORS.textInverted : COLORS.textContrast,
    };
};
