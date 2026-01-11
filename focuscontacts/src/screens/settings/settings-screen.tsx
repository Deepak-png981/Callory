import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from '../../navigation/main-tabs';
import {useAppContext} from '../../store/app-context';
import {Button} from '../../ui/components/button';
import {Card} from '../../ui/components/card';
import {Row} from '../../ui/components/row';
import {Screen} from '../../ui/components/screen';
import {SegmentedControl} from '../../ui/components/segmented';
import {Text} from '../../ui/components/text';
import {useTheme} from '../../ui/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'settingsTab'>;

export function SettingsScreen({navigation}: Props) {
  const {state, dispatch} = useAppContext();
  const theme = useTheme();
  const activeTemplate =
    state.templates.find(t => t.id === state.activeTemplateId) ?? state.templates[0] ?? null;
  const templateSettings = activeTemplate?.settings ?? {restoreStarsEnabled: true, repeatCallersEnabled: false};

  return (
    <Screen contentStyle={styles.container}>
      <Text variant="h2" weight="black">
        Settings
      </Text>
      <Text tone="muted">Control restoration behavior and optional repeat callers.</Text>

      <Card>
        <Text variant="h3" weight="black">
          Appearance
        </Text>
        <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />
        <SegmentedControl
          value={state.settings.themeMode}
          onChange={mode => dispatch({type: 'set_theme_mode', themeMode: mode})}
          options={[
            {value: 'system', label: 'SYSTEM'},
            {value: 'light', label: 'LIGHT'},
            {value: 'dark', label: 'DARK'},
          ]}
        />
      </Card>

      <Card>
        <Text variant="h3" weight="black">
          System & permissions
        </Text>
        <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />
        <Row>
          <View style={styles.rowText}>
            <Text weight="bold">Permissions / Setup</Text>
            <Text tone="muted" variant="small" style={{lineHeight: 18}}>
              Do Not Disturb access and system configuration.
            </Text>
          </View>
          <Button
            label="Open"
            variant="secondary"
            onPress={() => navigation.getParent()?.navigate('setupPermissions' as never)}
          />
        </Row>
      </Card>

      <Card>
        <Text variant="h3" weight="black">
          Focus behavior
        </Text>

        <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />

        <Row>
          <View style={styles.rowText}>
            <Text weight="bold">Restore starred contacts on Focus OFF</Text>
            <Text tone="muted" variant="small" style={{lineHeight: 18}}>
              Recommended. Brings back your previous favorites after Focus ends.
            </Text>
          </View>
          <SegmentedControl
            value={templateSettings.restoreStarsEnabled ? 'on' : 'off'}
            onChange={v => dispatch({type: 'set_restore_stars_enabled', restoreStarsEnabled: v === 'on'})}
            options={[
              {value: 'off', label: 'OFF'},
              {value: 'on', label: 'ON'},
            ]}
          />
        </Row>

        <View style={[styles.divider, {backgroundColor: theme.colors.border}]} />

        <Row>
          <View style={styles.rowText}>
            <Text weight="bold">Allow repeat callers</Text>
            <Text tone="muted" variant="small" style={{lineHeight: 18}}>
              If someone calls again shortly, let it ring during Focus.
            </Text>
          </View>
          <SegmentedControl
            value={templateSettings.repeatCallersEnabled ? 'on' : 'off'}
            onChange={v => dispatch({type: 'set_repeat_callers_enabled', repeatCallersEnabled: v === 'on'})}
            options={[
              {value: 'off', label: 'OFF'},
              {value: 'on', label: 'ON'},
            ]}
          />
        </Row>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});


