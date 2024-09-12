import { Text, View, TextInput} from 'react-native';
import React from 'react';
import AES256 from 'aes-everywhere'

export default function SignIn() {
	const [key, setKey] = React.useState('')
	const [data, setData] = React.useState('')
	const [encrypted, setEncrypted] = React.useState('')
	const [decrypted, setDecrypted] = React.useState('')

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
		  <TextInput
						style={{padding: 10, width: 300}}
						onChangeText={setKey}
						value={key}
						placeholder="input secure authentication key here"
					/>
		  <TextInput
						style={{padding: 10, width: 300}}
						onChangeText={(el) => {
								setData(el);
								// encrypt data and set encrypted
								const encrypted = AES256.encrypt(data, key)
								setEncrypted(encrypted)
								const decrypted = AES256.decrypt(encrypted, key)
								setDecrypted(decrypted)
						}}
						value={data}
						placeholder="data to encrypt"
					/>
      <Text
			  style={{padding: 10}}>
				{encrypted}
      </Text>
      <Text
			  style={{padding: 10}}>
      </Text>
    </View>
  );
}

// U2FsdGVkX1+goyAHIAES/MV7TPmMDTgFxzs/48em3GAm41zPxl3doqZ1e6Wurrx8
