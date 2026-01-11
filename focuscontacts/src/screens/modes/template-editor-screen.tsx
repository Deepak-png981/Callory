import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type {RootStackParamList} from '../../navigation/routes';
import {useAppContext} from '../../store/app-context';
import type {TemplateSchedule, TemplateSettings} from '../../store/types';
import {Button} from '../../ui/components/button';
import {Card} from '../../ui/components/card';
import {Row} from '../../ui/components/row';
import {Screen} from '../../ui/components/screen';
import {SegmentedControl} from '../../ui/components/segmented';
import {Text} from '../../ui/components/text';
import {TextField} from '../../ui/components/text-field';
import {useTheme} from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'templateEditor'>;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function minutesToHHMM(m: number) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(hh)}:${pad2(mm)}`;
}

function parseHHMM(input: string): number | null {
  const s = input.trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export function TemplateEditorScreen({route, navigation}: Props) {
  const {templateId} = route.params;
  const {state, dispatch} = useAppContext();
  const theme = useTheme();

  const template = state.templates.find(t => t.id === templateId) ?? null;

  React.useEffect(() => {
    if (!template) return;
    if (state.activeTemplateId !== template.id) {
      dispatch({type: 'set_active_template', templateId: template.id});
    }
  }, [dispatch, state.activeTemplateId, template, templateId]);

  const initialSettings: TemplateSettings = template?.settings ?? {
    restoreStarsEnabled: true,
    repeatCallersEnabled: false,
  };

  const [name, setName] = React.useState(template?.name ?? 'Mode');
  const [repeatCallersEnabled, setRepeatCallersEnabled] = React.useState(
    initialSettings.repeatCallersEnabled,
  );
  const [restoreStarsEnabled, setRestoreStarsEnabled] = React.useState(
    initialSettings.restoreStarsEnabled,
  );

  const initialSchedule: TemplateSchedule | null = template?.schedule ?? null;
  const [scheduleEnabled, setScheduleEnabled] = React.useState(Boolean(initialSchedule?.enabled));

  const [daysMode, setDaysMode] = React.useState<'daily' | 'weekdays' | 'weekends' | 'custom'>(
    initialSchedule?.daysOfWeek?.length
      ? initialSchedule.daysOfWeek.length === 7
        ? 'daily'
        : JSON.stringify(initialSchedule.daysOfWeek) === JSON.stringify([1, 2, 3, 4, 5])
          ? 'weekdays'
          : JSON.stringify(initialSchedule.daysOfWeek) === JSON.stringify([0, 6])
            ? 'weekends'
            : 'custom'
      : 'weekdays',
  );

  const [customDays, setCustomDays] = React.useState<number[]>(
    initialSchedule?.daysOfWeek?.length ? initialSchedule.daysOfWeek : [1, 2, 3, 4, 5],
  );

  const [startText, setStartText] = React.useState(
    minutesToHHMM(initialSchedule?.startMinutes ?? 9 * 60),
  );
  const [endText, setEndText] = React.useState(
    minutesToHHMM(initialSchedule?.endMinutes ?? 18 * 60),
  );

  const [error, setError] = React.useState<string | null>(null);

  function resolveDays(): number[] {
    if (daysMode === 'daily') return [0, 1, 2, 3, 4, 5, 6];
    if (daysMode === 'weekdays') return [1, 2, 3, 4, 5];
    if (daysMode === 'weekends') return [0, 6];
    return customDays.length ? customDays.slice().sort() : [1, 2, 3, 4, 5];
  }

  function toggleCustomDay(d: number) {
    setCustomDays(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));
  }

  function onSave() {
    if (!template) return;

    const startMinutes = parseHHMM(startText);
    const endMinutes = parseHHMM(endText);
    if (scheduleEnabled) {
      if (startMinutes == null || endMinutes == null) {
        setError('Please enter times like 09:00 and 18:00.');
        return;
      }
    }

    setError(null);
    dispatch({
      type: 'update_template',
      templateId: template.id,
      patch: {
        name: name.trim() || 'Mode',
        settings: {repeatCallersEnabled, restoreStarsEnabled},
        schedule: scheduleEnabled
          ? {
              enabled: true,
              daysOfWeek: resolveDays(),
              startMinutes: startMinutes ?? 9 * 60,
              endMinutes: endMinutes ?? 18 * 60,
            }
          : null,
      },
    });
    navigation.goBack();
  }

  function onDelete() {
    if (!template) return;
    Alert.alert('Delete mode?', `Delete “${template.name}”?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({type: 'delete_template', templateId: template.id});
          navigation.goBack();
        },
      },
    ]);
  }

  if (!template) {
    return (
      <Screen contentStyle={styles.fallback}>
        <Text weight="black">Mode not found.</Text>
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <Row>
            <Text variant="h2" weight="black">
              Edit Mode
            </Text>
            <Button label="Save" onPress={onSave} />
          </Row>

          {error ? (
            <Text tone="danger" weight="bold">
              {error}
            </Text>
          ) : null}

          <Card>
            <TextField label="Mode name" value={name} onChangeText={setName} />
          </Card>

          <Card>
            <Row>
              <View style={{gap: 4, flex: 1}}>
                <Text weight="black">Allowed people</Text>
                <Text tone="muted" variant="small">
                  Add the people who can call you during this Mode.
                </Text>
              </View>
              <Button
                label="Manage"
                variant="secondary"
                onPress={() => navigation.navigate('allowedContacts')}
              />
            </Row>
          </Card>

          <Card>
            <Text weight="black">Behavior</Text>
            <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />

            <View style={styles.settingRow}>
              <View style={{flex: 1, gap: 2}}>
                <Text weight="bold">Repeat callers</Text>
                <Text tone="muted" variant="small">
                  If someone calls again shortly, let it ring during Focus.
                </Text>
              </View>
              <View style={styles.settingRight}>
                <SegmentedControl
                  value={repeatCallersEnabled ? 'on' : 'off'}
                  onChange={v => setRepeatCallersEnabled(v === 'on')}
                  options={[
                    {value: 'off', label: 'OFF'},
                    {value: 'on', label: 'ON'},
                  ]}
                />
              </View>
            </View>

            <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />

            <View style={styles.settingRow}>
              <View style={{flex: 1, gap: 2}}>
                <Text weight="bold">Restore stars on stop</Text>
                <Text tone="muted" variant="small">
                  Recommended. Restores your starred contacts when Focus ends.
                </Text>
              </View>
              <View style={styles.settingRight}>
                <SegmentedControl
                  value={restoreStarsEnabled ? 'on' : 'off'}
                  onChange={v => setRestoreStarsEnabled(v === 'on')}
                  options={[
                    {value: 'off', label: 'OFF'},
                    {value: 'on', label: 'ON'},
                  ]}
                />
              </View>
            </View>
          </Card>

          <Card>
            <Text weight="black">Automation</Text>
            <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />

            <View style={styles.settingRow}>
              <View style={{flex: 1, gap: 2}}>
                <Text weight="bold">Schedule</Text>
                <Text tone="muted" variant="small">
                  Auto-enable this mode on a recurring timetable.
                </Text>
              </View>
              <View style={styles.settingRight}>
                <SegmentedControl
                  value={scheduleEnabled ? 'on' : 'off'}
                  onChange={v => setScheduleEnabled(v === 'on')}
                  options={[
                    {value: 'off', label: 'OFF'},
                    {value: 'on', label: 'ON'},
                  ]}
                />
              </View>
            </View>

            {scheduleEnabled ? (
              <View style={{marginTop: 12, gap: 12}}>
                <SegmentedControl
                  value={daysMode}
                  onChange={setDaysMode}
                  options={[
                    {value: 'weekdays', label: 'MON–FRI'},
                    {value: 'weekends', label: 'SAT–SUN'},
                    {value: 'daily', label: 'DAILY'},
                    {value: 'custom', label: 'CUSTOM'},
                  ]}
                />

                {daysMode === 'custom' ? (
                  <View style={styles.daysRow}>
                    {dayLabels.map((label, idx) => {
                      const selected = customDays.includes(idx);
                      return (
                        <Pressable
                          key={label + idx}
                          onPress={() => toggleCustomDay(idx)}
                          style={[
                            styles.dayPill,
                            {
                              backgroundColor: selected
                                ? theme.colors.primary
                                : theme.colors.surface2,
                              borderColor: theme.colors.border,
                            },
                          ]}>
                          <Text
                            weight="bold"
                            style={{color: selected ? '#FFFFFF' : theme.colors.text}}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                <View style={styles.timeRow}>
                  <View style={{flex: 1}}>
                    <TextField
                      label="Start (HH:MM)"
                      value={startText}
                      onChangeText={setStartText}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="09:00"
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <TextField
                      label="End (HH:MM)"
                      value={endText}
                      onChangeText={setEndText}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="18:00"
                    />
                  </View>
                </View>

                <Text tone="muted" variant="small">
                  Tip: For overnight schedules, set an end time earlier than start (e.g. 22:00 → 07:00).
                </Text>
              </View>
            ) : null}
          </Card>

          <Card>
            <Row>
              <View style={{gap: 4, flex: 1}}>
                <Text weight="black">Danger zone</Text>
                <Text tone="muted" variant="small">
                  This cannot be undone.
                </Text>
              </View>
              <Button label="Delete" variant="danger" onPress={onDelete} />
            </Row>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 18,
    gap: 14,
    paddingBottom: 28,
  },
  fallback: {
    flex: 1,
    padding: 18,
    gap: 12,
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    width: 160,
    alignItems: 'stretch',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

