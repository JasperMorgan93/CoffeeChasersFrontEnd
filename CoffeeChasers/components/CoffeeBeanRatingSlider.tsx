import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { UI } from '../constants/ui';
import { getRoastBeanColors, roastProgressFromStep } from '../constants/roast';

const KNOB_SIZE = UI.slider.knobSize;

type CoffeeBeanRatingSliderProps = {
  value: number;
  onChange: (nextValue: number) => void;
  steps?: number;
};

export default function CoffeeBeanRatingSlider({
  value,
  onChange,
  steps = 10,
}: CoffeeBeanRatingSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const animatedX = useRef(new Animated.Value(0)).current;
  const gestureStartX = useRef(0);
  const isDragging = useRef(false);

  const maxStep = Math.max(1, steps) - 1;
  const clampedValue = useMemo(() => Math.max(0, Math.min(maxStep, value)), [maxStep, value]);
  const travelDistance = Math.max(0, trackWidth - KNOB_SIZE);
  const roastColors = useMemo(
    () => getRoastBeanColors(roastProgressFromStep(clampedValue, steps)),
    [clampedValue, steps]
  );

  const positionForStep = (step: number) => {
    if (travelDistance <= 0 || maxStep <= 0) {
      return 0;
    }

    return (step / maxStep) * travelDistance;
  };

  const stepFromPosition = (x: number) => {
    if (travelDistance <= 0 || maxStep <= 0) {
      return clampedValue;
    }

    const normalized = Math.max(0, Math.min(travelDistance, x));
    return Math.round((normalized / travelDistance) * maxStep);
  };

  const positionFromTouch = (touchX: number) => {
    return Math.max(0, Math.min(travelDistance, touchX - KNOB_SIZE / 2));
  };

  const snapToStep = (step: number) => {
    const snapped = Math.max(0, Math.min(maxStep, step));
    onChange(snapped);

    Animated.spring(animatedX, {
      toValue: positionForStep(snapped),
      damping: 14,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (trackWidth <= 0 || isDragging.current) {
      return;
    }

    animatedX.setValue(positionForStep(clampedValue));
  }, [animatedX, clampedValue, trackWidth, travelDistance]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTrackWidth(width);
    animatedX.setValue(positionForStep(clampedValue));
  };

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin((event) => {
      isDragging.current = true;
      const startX = positionFromTouch(event.x);
      gestureStartX.current = startX;
      animatedX.setValue(startX);
      onChange(stepFromPosition(startX));
    })
    .onUpdate((event) => {
      const nextX = gestureStartX.current + event.translationX;
      const boundedX = Math.max(0, Math.min(travelDistance, nextX));

      animatedX.setValue(boundedX);
      onChange(stepFromPosition(boundedX));
    })
    .onFinalize((event) => {
      isDragging.current = false;
      const endX = gestureStartX.current + event.translationX;
      snapToStep(stepFromPosition(endX));
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.sliderShell} onLayout={onTrackLayout}>
        <View style={styles.trackBase} />

        <View
          style={[
            styles.trackFill,
            {
              width:
                trackWidth > 0
                  ? positionForStep(clampedValue) + KNOB_SIZE / 2
                  : KNOB_SIZE / 2,
            },
          ]}
        />

        <View style={styles.tickRow} pointerEvents="none">
          {Array.from({ length: Math.max(steps, 1) }).map((_, index) => (
            <View
              key={`tick-${index}`}
              style={[styles.tick, index <= clampedValue && styles.tickActive]}
            />
          ))}
        </View>

        <Animated.View
          style={[styles.knobWrap, { transform: [{ translateX: animatedX }] }]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.beanOuter,
              {
                backgroundColor: roastColors.outer,
                borderColor: roastColors.border,
              },
            ]}
          >
            <View style={[styles.beanInner, { backgroundColor: roastColors.inner }]}>
              <View style={[styles.beanCrease, { backgroundColor: roastColors.crease }]} />
              <View style={[styles.beanShine, { backgroundColor: roastColors.shine }]} />
            </View>
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sliderShell: {
    height: UI.slider.shellHeight,
    justifyContent: 'center',
  },
  trackBase: {
    position: 'absolute',
    left: KNOB_SIZE / 2,
    right: KNOB_SIZE / 2,
    height: UI.slider.trackHeight,
    borderRadius: UI.slider.borderRound,
    backgroundColor: COLORS.sliderTrackBase,
  },
  trackFill: {
    position: 'absolute',
    left: KNOB_SIZE / 2,
    height: UI.slider.trackHeight,
    borderRadius: UI.slider.borderRound,
    backgroundColor: COLORS.sliderTrackFill,
  },
  tickRow: {
    position: 'absolute',
    left: KNOB_SIZE / 2,
    right: KNOB_SIZE / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tick: {
    width: UI.slider.tickSize,
    height: UI.slider.tickSize,
    borderRadius: UI.slider.tickSize,
    backgroundColor: COLORS.sliderTick,
    borderWidth: 1,
    borderColor: COLORS.sliderTickBorder,
  },
  tickActive: {
    backgroundColor: COLORS.sliderTickActive,
    borderColor: COLORS.sliderTickActiveBorder,
  },
  knobWrap: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beanOuter: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: COLORS.roastOuterDark,
    transform: [{ rotate: '-18deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.roastBorderDark,
  },
  beanInner: {
    width: KNOB_SIZE - UI.slider.beanInnerInset,
    height: KNOB_SIZE - UI.slider.beanInnerInset,
    borderRadius: (KNOB_SIZE - UI.slider.beanInnerInset) / 2,
    backgroundColor: COLORS.roastInnerDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beanCrease: {
    width: UI.slider.beanCreaseWidth,
    height: KNOB_SIZE - 22,
    borderRadius: UI.slider.beanCreaseWidth,
    backgroundColor: COLORS.roastCreaseDark,
    opacity: 0.58,
    transform: [{ rotate: '16deg' }],
  },
  beanShine: {
    position: 'absolute',
    top: 11,
    left: 11,
    width: UI.slider.beanShineWidth,
    height: UI.slider.beanShineHeight,
    borderRadius: UI.slider.beanShineHeight,
    backgroundColor: 'rgba(255, 224, 186, 0.32)',
    transform: [{ rotate: '-24deg' }],
  },
});