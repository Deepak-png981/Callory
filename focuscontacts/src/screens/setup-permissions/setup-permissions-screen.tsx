import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import type {RootStackParamList} from '../../navigation/routes';
import {focusNative} from '../../native/focus-native';
import {Button} from '../../ui/components/button';
import {Card} from '../../ui/components/card';
import {Row} from '../../ui/components/row';
import {Screen} from '../../ui/components/screen';
import {Text} from '../../ui/components/text';
import {useTheme} from '../../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'setupPermissions'>;

export function SetupPermissionsScreen({navigation}: Props) {
  const theme = useTheme();
  const [hasDndAccess, setHasDndAccess] = React.useState<boolean | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isCancelled = false;

      async function refresh() {
        try {
          const granted = await focusNative.dnd.isPolicyAccessGranted();
          if (!isCancelled) setHasDndAccess(granted);
        } catch {
          if (!isCancelled) setHasDndAccess(false);
        }
      }

      refresh();
      return () => {
        isCancelled = true;
      };
    }, []),
  );

  async function openSettings() {
    try {
      await focusNative.dnd.openPolicyAccessSettings();
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }

  return (
    <Screen contentStyle={styles.container}>
      <Text variant="h2" weight="black">
        Setup
      </Text>
      <Text tone="muted">
        Focus needs Do Not Disturb access to allow calls from your chosen people.
      </Text>

      <Card>
        <Row>
          <Text variant="h3" weight="black">
            Do Not Disturb access
          </Text>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: hasDndAccess ? 'rgba(34,197,94,0.14)' : theme.colors.surface2,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text variant="small" weight="bold" tone={hasDndAccess ? 'success' : 'muted'}>
              {hasDndAccess === null ? 'CHECKING' : hasDndAccess ? 'GRANTED' : 'MISSING'}
            </Text>
          </View>
        </Row>

        <Text tone="muted" style={{marginTop: 10, lineHeight: 20}}>
          In system settings, enable “Allow notification policy access” for Callory.
        </Text>

        <View style={{marginTop: 14}}>
          <Button label="Open system settings" size="lg" onPress={openSettings} />
        </View>
      </Card>

      {hasDndAccess ? <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    gap: 14,
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
});


