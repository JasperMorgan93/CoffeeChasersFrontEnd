import { StyleSheet, View } from 'react-native';
import { getRoastBeanColors, roastProgressFromRating } from '../constants/roast';
import { UI } from '../constants/ui';

type RatingBeanIconProps = {
  rating: number;
  size?: number;
};

const MIN_RATING = 1;
const MAX_RATING = 5;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

export default function RatingBeanIcon({ rating, size = UI.slider.knobSize }: RatingBeanIconProps) {
  const normalizedRating = Number.isFinite(rating) ? clamp(rating, MIN_RATING, MAX_RATING) : MIN_RATING;
  const roastColors = getRoastBeanColors(roastProgressFromRating(normalizedRating, MAX_RATING, MIN_RATING));

  const innerSize = Math.max(2, size - UI.slider.beanInnerInset);

  return (
    <View
      style={[
        styles.beanOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: roastColors.outer,
          borderColor: roastColors.border,
        },
      ]}
    >
      <View
        style={[
          styles.beanInner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: roastColors.inner,
          },
        ]}
      >
        <View
          style={[
            styles.beanCrease,
            {
              width: Math.max(2, size * 0.14),
              height: Math.max(6, size * 0.54),
              borderRadius: Math.max(2, size * 0.14),
              backgroundColor: roastColors.crease,
            },
          ]}
        />
        <View
          style={[
            styles.beanShine,
            {
              top: size * 0.19,
              left: size * 0.19,
              width: Math.max(4, size * 0.2),
              height: Math.max(2, size * 0.1),
              borderRadius: Math.max(2, size * 0.1),
              backgroundColor: roastColors.shine,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  beanOuter: {
    transform: [{ rotate: '-18deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  beanInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  beanCrease: {
    opacity: 0.58,
    transform: [{ rotate: '16deg' }],
  },
  beanShine: {
    position: 'absolute',
    transform: [{ rotate: '-24deg' }],
  },
});
