import {PermissionsAndroid, Platform} from 'react-native';

export async function ensureAndroidContactsPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
  ]);

  const read = results[PermissionsAndroid.PERMISSIONS.READ_CONTACTS];
  const write = results[PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS];

  return (
    read === PermissionsAndroid.RESULTS.GRANTED &&
    write === PermissionsAndroid.RESULTS.GRANTED
  );
}


