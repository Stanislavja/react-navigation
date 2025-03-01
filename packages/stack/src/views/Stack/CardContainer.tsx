import * as React from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Route, useTheme } from '@react-navigation/native';
import {
  HeaderShownContext,
  HeaderHeightContext,
  HeaderBackContext,
  getHeaderTitle,
} from '@react-navigation/elements';
import type { Props as HeaderContainerProps } from '../Header/HeaderContainer';
import Card from './Card';
import { forModalPresentationIOS } from '../../TransitionConfigs/CardStyleInterpolators';
import ModalPresentationContext from '../../utils/ModalPresentationContext';
import type {
  Layout,
  StackHeaderMode,
  StackCardMode,
  TransitionPreset,
  Scene,
} from '../../types';

type Props = TransitionPreset & {
  index: number;
  active: boolean;
  focused: boolean;
  closing: boolean;
  layout: Layout;
  gesture: Animated.Value;
  scene: Scene;
  safeAreaInsetTop: number;
  safeAreaInsetRight: number;
  safeAreaInsetBottom: number;
  safeAreaInsetLeft: number;
  cardOverlay?: (props: {
    style: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  }) => React.ReactNode;
  cardOverlayEnabled: boolean;
  cardShadowEnabled?: boolean;
  cardStyle?: StyleProp<ViewStyle>;
  getPreviousScene: (props: { route: Route<string> }) => Scene | undefined;
  getFocusedRoute: () => Route<string>;
  renderHeader: (props: HeaderContainerProps) => React.ReactNode;
  renderScene: (props: { route: Route<string> }) => React.ReactNode;
  onOpenRoute: (props: { route: Route<string> }) => void;
  onCloseRoute: (props: { route: Route<string> }) => void;
  onTransitionStart?: (
    props: { route: Route<string> },
    closing: boolean
  ) => void;
  onTransitionEnd?: (props: { route: Route<string> }, closing: boolean) => void;
  onPageChangeStart?: () => void;
  onPageChangeConfirm?: (force: boolean) => void;
  onPageChangeCancel?: () => void;
  onGestureStart?: (props: { route: Route<string> }) => void;
  onGestureEnd?: (props: { route: Route<string> }) => void;
  onGestureCancel?: (props: { route: Route<string> }) => void;
  gestureEnabled?: boolean;
  gestureResponseDistance?: {
    vertical?: number;
    horizontal?: number;
  };
  gestureVelocityImpact?: number;
  mode: StackCardMode;
  headerMode: StackHeaderMode;
  headerShown: boolean;
  hasAbsoluteHeader: boolean;
  headerHeight: number;
  onHeaderHeightChange: (props: {
    route: Route<string>;
    height: number;
  }) => void;
  isParentHeaderShown: boolean;
};

const EPSILON = 0.1;

function CardContainer({
  active,
  cardOverlay,
  cardOverlayEnabled,
  cardShadowEnabled,
  cardStyle,
  cardStyleInterpolator,
  closing,
  gesture,
  focused,
  gestureDirection,
  gestureEnabled,
  gestureResponseDistance,
  gestureVelocityImpact,
  getPreviousScene,
  getFocusedRoute,
  mode,
  headerMode,
  headerShown,
  headerStyleInterpolator,
  hasAbsoluteHeader,
  headerHeight,
  onHeaderHeightChange,
  isParentHeaderShown,
  index,
  layout,
  onCloseRoute,
  onOpenRoute,
  onPageChangeCancel,
  onPageChangeConfirm,
  onPageChangeStart,
  onGestureCancel,
  onGestureEnd,
  onGestureStart,
  onTransitionEnd,
  onTransitionStart,
  renderHeader,
  renderScene,
  safeAreaInsetBottom,
  safeAreaInsetLeft,
  safeAreaInsetRight,
  safeAreaInsetTop,
  scene,
  transitionSpec,
}: Props) {
  const handleOpen = () => {
    const { route } = scene.descriptor;

    onTransitionEnd?.({ route }, false);
    onOpenRoute({ route });
  };

  const handleClose = () => {
    const { route } = scene.descriptor;

    onTransitionEnd?.({ route }, true);
    onCloseRoute({ route });
  };

  const handleGestureBegin = () => {
    const { route } = scene.descriptor;

    onPageChangeStart?.();
    onGestureStart?.({ route });
  };

  const handleGestureCanceled = () => {
    const { route } = scene.descriptor;

    onPageChangeCancel?.();
    onGestureCancel?.({ route });
  };

  const handleGestureEnd = () => {
    const { route } = scene.descriptor;

    onGestureEnd?.({ route });
  };

  const handleTransition = ({
    closing,
    gesture,
  }: {
    closing: boolean;
    gesture: boolean;
  }) => {
    const { route } = scene.descriptor;

    if (!gesture) {
      onPageChangeConfirm?.(true);
    } else if (active && closing) {
      onPageChangeConfirm?.(false);
    } else {
      onPageChangeCancel?.();
    }

    onTransitionStart?.({ route }, closing);
  };

  const insets = {
    top: safeAreaInsetTop,
    right: safeAreaInsetRight,
    bottom: safeAreaInsetBottom,
    left: safeAreaInsetLeft,
  };

  const { colors } = useTheme();

  const [pointerEvents, setPointerEvents] = React.useState<'box-none' | 'none'>(
    'box-none'
  );

  React.useEffect(() => {
    // @ts-expect-error: AnimatedInterpolation optionally has addListener, but the type defs don't think so
    const listener = scene.progress.next?.addListener?.(
      ({ value }: { value: number }) => {
        setPointerEvents(value <= EPSILON ? 'box-none' : 'none');
      }
    );

    return () => {
      if (listener) {
        // @ts-expect-error: AnimatedInterpolation optionally has removedListener, but the type defs don't think so
        scene.progress.next?.removeListener?.(listener);
      }
    };
  }, [pointerEvents, scene.progress.next]);

  const isModalPresentation = cardStyleInterpolator === forModalPresentationIOS;
  const previousScene = getPreviousScene({ route: scene.descriptor.route });

  let backTitle: string | undefined;

  if (previousScene) {
    const { options, route } = previousScene.descriptor;

    backTitle = getHeaderTitle(options, route.name);
  }

  const headerBack = React.useMemo(
    () => (backTitle !== undefined ? { title: backTitle } : undefined),
    [backTitle]
  );

  return (
    <Card
      index={index}
      gestureDirection={gestureDirection}
      layout={layout}
      insets={insets}
      gesture={gesture}
      current={scene.progress.current}
      next={scene.progress.next}
      closing={closing}
      onOpen={handleOpen}
      onClose={handleClose}
      overlay={cardOverlay}
      overlayEnabled={cardOverlayEnabled}
      shadowEnabled={cardShadowEnabled}
      onTransition={handleTransition}
      onGestureBegin={handleGestureBegin}
      onGestureCanceled={handleGestureCanceled}
      onGestureEnd={handleGestureEnd}
      gestureEnabled={gestureEnabled}
      gestureResponseDistance={gestureResponseDistance}
      gestureVelocityImpact={gestureVelocityImpact}
      transitionSpec={transitionSpec}
      styleInterpolator={cardStyleInterpolator}
      accessibilityElementsHidden={!focused}
      importantForAccessibility={focused ? 'auto' : 'no-hide-descendants'}
      pointerEvents={active ? 'box-none' : pointerEvents}
      pageOverflowEnabled={headerMode !== 'float' && mode === 'card'}
      containerStyle={hasAbsoluteHeader ? { marginTop: headerHeight } : null}
      contentStyle={[{ backgroundColor: colors.background }, cardStyle]}
      style={[
        {
          // This is necessary to avoid unfocused larger pages increasing scroll area
          // The issue can be seen on the web when a smaller screen is pushed over a larger one
          overflow: active ? undefined : 'hidden',
        },
        StyleSheet.absoluteFill,
      ]}
    >
      <View style={styles.container}>
        <View style={styles.scene}>
          <HeaderBackContext.Provider value={headerBack}>
            <HeaderShownContext.Provider
              value={isParentHeaderShown || headerShown !== false}
            >
              <HeaderHeightContext.Provider value={headerHeight}>
                {renderScene({ route: scene.descriptor.route })}
              </HeaderHeightContext.Provider>
            </HeaderShownContext.Provider>
          </HeaderBackContext.Provider>
        </View>
        {headerMode !== 'float' ? (
          <ModalPresentationContext.Provider value={isModalPresentation}>
            {renderHeader({
              mode: 'screen',
              layout,
              insets,
              scenes: [previousScene, scene],
              getPreviousScene,
              getFocusedRoute,
              gestureDirection,
              styleInterpolator: headerStyleInterpolator,
              onContentHeightChange: onHeaderHeightChange,
            })}
          </ModalPresentationContext.Provider>
        ) : null}
      </View>
    </Card>
  );
}

export default React.memo(CardContainer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  scene: {
    flex: 1,
  },
});
