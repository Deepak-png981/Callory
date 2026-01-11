import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {FlatList, StyleSheet, View, useWindowDimensions} from 'react-native';
import type {RootStackParamList} from '../../navigation/routes';
import {useAppContext} from '../../store/app-context';
import {useTheme} from '../../ui/theme';
import {Screen} from '../../ui/components/screen';
import {Text} from '../../ui/components/text';
import {Button} from '../../ui/components/button';
import {Chip} from '../../ui/components/chip';
import {TextField} from '../../ui/components/text-field';

type Props = NativeStackScreenProps<RootStackParamList, 'onboarding'>;

interface OnboardingStep {
  title: string;
  body: string;
  kicker: string;
}

const steps: OnboardingStep[] = [
  {
    kicker: 'WELCOME',
    title: 'What should we call you?',
    body: 'We’ll personalize your home screen. Stored locally on your device.',
  },
  {
    kicker: 'FOCUS MODE',
    title: 'Mute distractions.\nNever miss important calls.',
    body: 'Turn on Focus mode with one tap.',
  },
  {
    kicker: 'ALLOW-LIST',
    title: 'Pick important people',
    body: 'You’ll choose people using Android’s contact picker. We use Contacts permission to temporarily manage “starred” contacts so only your allow-list can ring.',
  },
  {
    kicker: 'DO NOT DISTURB',
    title: 'Enable Do Not Disturb access',
    body: 'Focus needs Notification Policy access to manage Do Not Disturb.',
  },
  {
    kicker: 'READY',
    title: 'Setup complete',
    body: 'You’re ready to focus.',
  },
];

export function OnboardingScreen({navigation}: Props) {
  const {state, dispatch} = useAppContext();
  const theme = useTheme();
  const dims = useWindowDimensions();
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = steps[stepIndex] ?? steps[0];
  const isLast = stepIndex === steps.length - 1;
  const listRef = React.useRef<FlatList<OnboardingStep> | null>(null);
  const [nameDraft, setNameDraft] = React.useState(state.userName ?? '');

  function goNext() {
    if (isLast) {
      dispatch({type: 'set_onboarding_completed', hasCompletedOnboarding: true});
      navigation.reset({index: 0, routes: [{name: 'mainTabs'}]});
      return;
    }

    if (stepIndex === 0) {
      const cleaned = nameDraft.trim();
      if (!cleaned) return;
      dispatch({type: 'set_user_name', userName: cleaned});
    }

    const next = Math.min(stepIndex + 1, steps.length - 1);
    setStepIndex(next);
    listRef.current?.scrollToIndex({index: next, animated: true});
  }

  function skip() {
    dispatch({type: 'set_onboarding_completed', hasCompletedOnboarding: true});
    navigation.reset({index: 0, routes: [{name: 'mainTabs'}]});
  }

  return (
    <Screen style={{backgroundColor: theme.colors.background}} contentStyle={styles.container}>
      <View style={styles.hero}>
        <View style={[styles.blob, styles.blobA, {backgroundColor: theme.colors.primary}]} />
        <View style={[styles.blob, styles.blobB, {backgroundColor: theme.colors.primary2}]} />
        <View style={[styles.logo, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]} />
      </View>

      <FlatList
        ref={r => (listRef.current = r)}
        data={steps}
        keyExtractor={(_, idx) => String(idx)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => (
          <View style={[styles.slide, {width: dims.width - 36}]}>
            <Chip label={item.kicker} />
            <Text variant="title" weight="black" style={styles.title}>
              {item.title}
            </Text>
            <Text tone="muted" style={styles.body}>
              {item.body}
            </Text>

            {index === 0 ? (
              <View style={{marginTop: 10}}>
                <TextField
                  label="Your name"
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  placeholder="e.g. Deepak"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>
            ) : null}
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === stepIndex ? theme.colors.primary : theme.colors.border,
                  width: i === stepIndex ? 18 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.footerButtons}>
          {!isLast ? <Button label="Skip" variant="ghost" onPress={skip} /> : <View style={{flex: 1}} />}
          <View style={{flex: 1}} />
          <Button
            label={isLast ? 'Get started' : 'Next'}
            size="lg"
            onPress={goNext}
            disabled={stepIndex === 0 && nameDraft.trim().length === 0}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 14,
  },
  hero: {
    height: 150,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 160,
    opacity: 0.22,
  },
  blobA: {
    top: -120,
    left: -120,
  },
  blobB: {
    bottom: -140,
    right: -140,
  },
  slide: {
    paddingTop: 6,
    gap: 12,
  },
  title: {
    lineHeight: 38,
  },
  body: {
    lineHeight: 22,
  },
  footer: {
    marginTop: 'auto',
    gap: 14,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 99,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});


