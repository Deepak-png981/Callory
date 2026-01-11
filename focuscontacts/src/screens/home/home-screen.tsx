import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {MainTabParamList} from '../../navigation/main-tabs';
import {useAppContext} from '../../store/app-context';
import {maxAllowedContacts} from '../../features/allowed-contacts/rules';
import {Avatar} from '../../ui/components/avatar';
import {Button} from '../../ui/components/button';
import {Card} from '../../ui/components/card';
import {Chip} from '../../ui/components/chip';
import {Row} from '../../ui/components/row';
import {Screen} from '../../ui/components/screen';
import {Text} from '../../ui/components/text';

type Props = BottomTabScreenProps<MainTabParamList, 'homeTab'>;

export function HomeScreen({navigation}: Props) {
  const {state} = useAppContext();

  const activeTemplate =
    state.templates.find(t => t.id === state.activeTemplateId) ?? state.templates[0] ?? null;
  const contacts = activeTemplate?.allowedContacts ?? [];
  const allowedCount = contacts.length;
  const activeModeName = activeTemplate?.name ?? 'Mode';

  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.topRow}>
        <View style={{gap: 6}}>
          <Text variant="h2" weight="black">{`Callory${state.userName ? `, ${state.userName}` : ''}`}</Text>
          <Text tone="muted">
            Stay in flow. Let only your important people ring.
          </Text>
          <Text weight="bold" tone="muted" variant="small">{`Active mode: ${activeModeName}`}</Text>
        </View>
        <Chip label={`Allowed: ${allowedCount}/${maxAllowedContacts}`} />
      </View>

      <Card>
        <Row>
          <View style={{gap: 4}}>
            <Text variant="h3" weight="black">
              Allowed people
            </Text>
            <Text tone="muted" variant="small">
              These people can call you when a Mode is active.
            </Text>
          </View>
          <Button
            label="Manage"
            variant="secondary"
            onPress={() => navigation.getParent()?.navigate('allowedContacts' as never)}
          />
        </Row>

        {contacts.length > 0 ? (
          <View style={styles.list}>
            {contacts.slice(0, maxAllowedContacts).map(c => (
              <View key={c.id} style={styles.contactRow}>
                <Avatar name={c.displayName} size={34} />
                <View style={styles.contactText}>
                  <Text weight="bold" numberOfLines={1}>
                    {c.displayName}
                  </Text>
                  <Text tone="muted" variant="small">
                    {c.phoneNumberNormalized}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text tone="muted" style={{marginTop: 10}}>
            No one yet. Add at least one person to enable Focus.
          </Text>
        )}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  list: {
    marginTop: 12,
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    flex: 1,
    gap: 2,
  },
});


