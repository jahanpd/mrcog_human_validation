import { router } from 'expo-router';
import { Text, View, TextInput} from 'react-native';
import React from 'react';

import { useSession } from '../ctx';

export default function SignIn() {
  const { signIn } = useSession();
	const [key, setKey] = React.useState('')

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
		  <TextInput
						style={{padding: 10, width: 300}}
						onChangeText={setKey}
						value={key}
						placeholder="input secure authentication key here"
					/>
      <Text
			  style={{padding: 10}}
        onPress={() => {
          signIn(key);
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace('/');
        }}>
        Sign In
      </Text>
    </View>
  );
}
