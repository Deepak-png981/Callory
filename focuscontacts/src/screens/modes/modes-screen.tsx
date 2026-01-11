import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import type {MainTabParamList} from '../../navigation/main-tabs';
import {applyFocus, restoreFocus} from '../../focus/focus-engine';
import {maxAllowedContacts} from '../../features/allowed-contacts/rules';
import {focusNative} from '../../native/focus-native';
import {useAppContext} from '../../store/app-context';
import {ensureAndroidContactsPermissions} from '../../utils/permissions';
import {Button} from '../../ui/components/button';
import {Card} from '../../ui/components/card';
import {Icon} from '../../ui/components/icon';
import {Row} from '../../ui/components/row';
import {Screen} from '../../ui/components/screen';
import {Text} from '../../ui/components/text';
import {useTheme} from '../../ui/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'modesTab'>;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function minutesToHHMM(m: number) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(hh)}:${pad2(mm)}`;
}

function formatSchedule(schedule: {enabled: boolean; daysOfWeek: number[]; startMinutes: number; endMinutes: number} | null) {
  if (!schedule || !schedule.enabled || schedule.daysOfWeek.length === 0) return 'No schedule';
  const days = schedule.daysOfWeek.slice().sort().join(',');
  const label =
    days === '1,2,3,4,5'
      ? 'Mon–Fri'
      : days === '0,6'
        ? 'Sat–Sun'
        : days === '0,1,2,3,4,5,6'
          ? 'Daily'
          : 'Custom';
  return `${label} ${minutesToHHMM(schedule.startMinutes)}–${minutesToHHMM(schedule.endMinutes)}`;
}

export function ModesScreen({navigation}: Props) {
  const {state, dispatch} = useAppContext();
  const theme = useTheme();
  const [hasDndAccess, setHasDndAccess] = React.useState<boolean | null>(null);
  const [isToggling, setIsToggling] = React.useState(false);

  const activeTemplate =
    state.templates.find(t => t.id === state.activeTemplateId) ?? state.templates[0] ?? null;
  const appliedTemplate =
    state.templates.find(t => t.id === state.appliedTemplateId) ?? activeTemplate;

  const contacts = activeTemplate?.allowedContacts ?? [];
  const allowedCount = contacts.length;
  const repeatCallersEnabled = activeTemplate?.settings.repeatCallersEnabled ?? false;
  const restoreStarsEnabled = appliedTemplate?.settings.restoreStarsEnabled ?? true;
  const activeTemplateName = activeTemplate?.name ?? 'Mode';

  React.useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const granted = await focusNative.dnd.isPolicyAccessGranted();
        if (!isCancelled) setHasDndAccess(granted);
      } catch {
        if (!isCancelled) setHasDndAccess(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  async function toggleFocus(next: boolean) {
    if (isToggling) return;

    if (next) {
      setIsToggling(true);
      try {
        const granted = await focusNative.dnd.isPolicyAccessGranted();
        setHasDndAccess(granted);
        if (!granted) {
          navigation.getParent()?.navigate('setupPermissions' as never);
          return;
        }

        if (allowedCount === 0) {
          Alert.alert('Add a contact', 'Add at least one allowed contact before enabling Focus.');
          navigation.getParent()?.navigate('allowedContacts' as never);
          return;
        }

        const ok = await ensureAndroidContactsPermissions();
        if (!ok) {
          Alert.alert(
            'Contacts permission required',
            'We need Contacts permission to manage starred contacts for Focus mode.',
          );
          return;
        }

        const res = await applyFocus({
          allowedContacts: contacts,
          repeatCallersEnabled,
        });

        dispatch({
          type: 'set_focus_snapshots',
          dndSnapshot: res.dndSnapshot,
          starredSnapshot: res.starredSnapshot,
        });
        dispatch({
          type: 'set_focus_enabled',
          focusEnabled: true,
          appliedTemplateId: activeTemplate?.id ?? null,
        });
      } catch (e) {
        Alert.alert('Error', String(e));
      } finally {
        setIsToggling(false);
      }
      return;
    }

    setIsToggling(true);
    try {
      await restoreFocus({
        allowedContacts: appliedTemplate?.allowedContacts ?? contacts,
        restoreStarsEnabled,
        dndSnapshot: state.dndSnapshot,
        starredSnapshot: state.starredSnapshot,
      });
    } finally {
      dispatch({type: 'set_focus_enabled', focusEnabled: false, appliedTemplateId: null});
      dispatch({type: 'set_focus_snapshots', dndSnapshot: null, starredSnapshot: null});
      setIsToggling(false);
    }
  }

  const isOn = state.focusEnabled;

  return (
    <Screen contentStyle={styles.container}>
      <View style={{gap: 6}}>
        <Text variant="h2" weight="black">
          Modes
        </Text>
        <Text tone="muted">Your focus mode, templates, and schedules.</Text>
      </View>

      <View style={styles.split}>
        {/* 60%: scrollable modes list */}
        <View style={styles.top60}>
          <Card style={{flex: 1}}>
            <Row>
              <View style={{gap: 4, flex: 1}}>
                <Text variant="h3" weight="black">
                  Active mode
                </Text>
                <Text tone="muted" variant="small">
                  {activeTemplateName}
                </Text>
              </View>
              <Button
                label="New"
                variant="secondary"
                onPress={() => {
                  const id = `tpl_${Date.now()}_${Math.random().toString(16).slice(2)}`;
                  dispatch({
                    type: 'create_template',
                    template: {
                      id,
                      name: 'New mode',
                      allowedContacts: [],
                      settings: {restoreStarsEnabled: true, repeatCallersEnabled: false},
                      schedule: null,
                    },
                  });
                  navigation
                    .getParent()
                    ?.navigate('templateEditor' as never, {templateId: id} as never);
                }}
              />
            </Row>

            <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />

            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={{gap: 10, paddingBottom: 4}}
              showsVerticalScrollIndicator={false}>
              {state.templates.map(t => {
                const selected = t.id === (state.activeTemplateId ?? state.templates[0]?.id);
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      navigation
                        .getParent()
                        ?.navigate('templateEditor' as never, {templateId: t.id} as never);
                    }}
                    style={[
                      styles.modeItem,
                      {
                        backgroundColor: selected ? theme.colors.surface2 : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}>
                    <Row>
                      <View style={{gap: 2, flex: 1}}>
                        <Text weight="black">{t.name}</Text>
                        <Text tone="muted" variant="small">
                          {t.allowedContacts.length} people · {formatSchedule(t.schedule)}
                        </Text>
                      </View>
                      {selected ? (
                        <Icon name={'checkmark' as never} size={18} color={theme.colors.primary} />
                      ) : null}
                    </Row>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        </View>

        {/* 40%: pinned Focus control */}
        <View style={styles.bottom40}>
          <Pressable
            onPress={() => toggleFocus(!isOn)}
            disabled={isToggling}
            style={[
              styles.circle,
              {
                borderColor: theme.colors.border,
                backgroundColor: isOn ? theme.colors.primary : theme.colors.surface,
              },
            ]}>
            <View
              style={[
                styles.circleInner,
                {
                  borderColor: isOn ? 'rgba(255,255,255,0.35)' : theme.colors.border,
                  backgroundColor: isOn ? 'rgba(255,255,255,0.14)' : theme.colors.surface2,
                },
              ]}>
              <Icon
                name={(isOn ? 'power' : 'power-outline') as never}
                size={34}
                color={isOn ? '#FFFFFF' : theme.colors.text}
              />
            </View>
            <Text weight="black" style={{color: isOn ? '#FFFFFF' : theme.colors.text}}>
              {isToggling ? 'Working…' : isOn ? 'FOCUS ON' : 'FOCUS OFF'}
            </Text>
            <Text
              tone={isOn ? 'default' : 'muted'}
              variant="small"
              style={{textAlign: 'center', marginTop: 4}}>
              Tap to {isOn ? 'disable' : 'enable'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    gap: 14,
  },
  split: {
    flex: 1,
    gap: 14,
  },
  top60: {
    flex: 0.6,
    minHeight: 240,
  },
  bottom40: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  modeItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 12,
  },
  circle: {
    width: 210,
    height: 210,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  circleInner: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 12,
  },
});

