import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import type {RootStackParamList} from '../../navigation/routes';
import {focusNative} from '../../native/focus-native';
import {useAppContext} from '../../store/app-context';
import type {AllowedContact} from '../../store/types';
import {canAddAllowedContact, maxAllowedContacts} from '../../features/allowed-contacts/rules';
import {normalizePhoneNumber} from '../../utils/phone';
import {ensureAndroidContactsPermissions} from '../../utils/permissions';
import {Avatar} from '../../ui/components/avatar';
import {Button} from '../../ui/components/button';
import {Card} from '../../ui/components/card';
import {Row} from '../../ui/components/row';
import {Screen} from '../../ui/components/screen';
import {Text} from '../../ui/components/text';
import {useTheme} from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'allowedContacts'>;

export function AllowedContactsScreen({}: Props) {
  const {state, dispatch} = useAppContext();
  const theme = useTheme();
  const activeTemplate =
    state.templates.find(t => t.id === state.activeTemplateId) ?? state.templates[0] ?? null;
  const contacts = activeTemplate?.allowedContacts ?? [];

  const [pendingPick, setPendingPick] = React.useState<null | {
    displayName: string;
    lookupKey: string;
    phoneNumbers: string[];
  }>(null);

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  async function onAdd() {
    try {
      const ok = await ensureAndroidContactsPermissions();
      if (!ok) {
        Alert.alert(
          'Contacts permission required',
          'We need Contacts permission to pick a person and manage starred contacts for Focus mode.',
        );
        return;
      }

      if (contacts.length >= maxAllowedContacts) {
        Alert.alert('Limit reached', `V1 supports up to ${maxAllowedContacts} allowed contacts.`);
        return;
      }

      const picked = await focusNative.picker.pickContact();
      if (!picked) return;

      const name = picked.displayName?.trim() || 'Unnamed contact';
      const numbers = (picked.phoneNumbers || []).map(n => n.trim()).filter(Boolean);
      if (numbers.length === 0) {
        Alert.alert('No number', 'That contact has no phone number.');
        return;
      }

      if (numbers.length === 1) {
        addAllowedContact(name, picked.lookupKey, numbers[0]!);
        return;
      }

      setPendingPick({displayName: name, lookupKey: picked.lookupKey, phoneNumbers: numbers});
      setIsModalVisible(true);
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }

  function addAllowedContact(displayName: string, lookupKey: string, selectedNumber: string) {
    const normalized = normalizePhoneNumber(selectedNumber);
    const check = canAddAllowedContact(contacts, normalized);
    if (!check.ok) {
      if (check.reason === 'cap_reached') {
        Alert.alert('Limit reached', `V1 supports up to ${maxAllowedContacts} allowed contacts.`);
        return;
      }
      if (check.reason === 'duplicate') {
        Alert.alert('Duplicate', 'That phone number is already in your allowed list.');
        return;
      }
      Alert.alert('Invalid number', 'Please select a valid phone number.');
      return;
    }

    const newContact: AllowedContact = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      displayName,
      phoneNumberNormalized: normalized,
      contactLookupKey: lookupKey,
      createdAt: Date.now(),
    };

    dispatch({type: 'add_allowed_contact', contact: newContact});
  }

  function onClearAll() {
    if (contacts.length === 0) return;
    Alert.alert('Clear all?', 'Remove all allowed contacts?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => dispatch({type: 'clear_allowed_contacts'}),
      },
    ]);
  }

  return (
    <Screen contentStyle={styles.container}>
      <Row>
        <View style={{gap: 4}}>
          <Text variant="h2" weight="black">
            Allowed
          </Text>
          <Text tone="muted">
            Up to {maxAllowedContacts} people can ring during a Mode.
          </Text>
        </View>
      </Row>

      <Card>
        <Row>
          <Text variant="h3" weight="black">
            Allowed contacts
          </Text>
          <Text tone="muted" weight="bold">
            {contacts.length}/{maxAllowedContacts}
          </Text>
        </Row>

        {contacts.length === 0 ? (
          <View style={{marginTop: 12, gap: 12}}>
            <Text tone="muted">No allowed contacts yet.</Text>
            <Button label="Add contact" size="lg" onPress={onAdd} />
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={c => c.id}
            contentContainerStyle={styles.list}
            renderItem={({item}) => (
              <View
                style={[
                  styles.item,
                  {backgroundColor: theme.colors.surface2, borderColor: theme.colors.border},
                ]}>
                <Avatar name={item.displayName} size={42} />
                <View style={styles.itemText}>
                  <Text weight="black">{item.displayName}</Text>
                  <Text variant="small" tone="muted">
                    {item.phoneNumberNormalized}
                  </Text>
                </View>
                <Button
                  label="Remove"
                  variant="ghost"
                  onPress={() => dispatch({type: 'remove_allowed_contact', id: item.id})}
                />
              </View>
            )}
          />
        )}
      </Card>

      {contacts.length > 0 ? (
        <View style={styles.footer}>
          <Button label="+ Add contact" size="lg" onPress={onAdd} />
          <Button label="Clear all" variant="secondary" onPress={onClearAll} />
        </View>
      ) : null}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={[styles.modalBackdrop, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
          <View style={[styles.modalCard, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
            <Text variant="h3" weight="black">
              Choose a number
            </Text>
            <Text tone="muted" variant="small">
              {pendingPick?.displayName ?? 'Selected contact'}
            </Text>

            <View style={styles.modalList}>
              {(pendingPick?.phoneNumbers ?? []).map(number => (
                <Button
                  key={number}
                  label={number}
                  variant="secondary"
                  onPress={() => {
                    const p = pendingPick;
                    if (!p) return;
                    setIsModalVisible(false);
                    setPendingPick(null);
                    addAllowedContact(p.displayName, p.lookupKey, number);
                  }}
                />
              ))}
            </View>

            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => {
                setIsModalVisible(false);
                setPendingPick(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    gap: 14,
  },
  list: {
    gap: 10,
    paddingTop: 14,
    paddingBottom: 4,
  },
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    gap: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  modalList: {
    gap: 8,
    paddingVertical: 6,
  },
});


