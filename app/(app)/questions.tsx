import { Text, View, ScrollView, Button, StyleSheet, Dimensions } from "react-native";
import clinicians from '../../assets/clinicians.json';
import encrypted from '../../assets/encrypted.json';
import { QuestionWrapper } from '../../components/Question';
import React, {useState, useEffect} from 'react';
import AES256 from 'aes-everywhere'
import { useSession } from '../../ctx';
import { router } from 'expo-router';

const decryptData = (enc, key) => {
  try {
			return JSON.parse(AES256.decrypt(enc, key))
	} catch {
			return ''
	}
}

export default function Questions(params) {

  const { signOut } = useSession();
  const { session, isLoading } = useSession();
  
	const data = decryptData(encrypted, session)

	if (!data) {
		return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
			  style={{padding: 10}}
        >
        Secret key used to sign in is incorrect. Unable to parse question bank.
      </Text>
      <Text
			  style={{padding: 10}}
        onPress={() => {
          signOut();
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace('/sign-in');
        }}>
        Sign Out
      </Text>
    </View>
		)
	}
  const who = params.who;
  const setWho = params.setWho;
	const response = params.response;
	const setResponse = params.setResponse;
	const supabase = params.supabase;


	console.log("response", response)
  console.log("supabase", response)
	const [filtered, setFiltered] = useState(data.filter(qn => !response.includes(qn.id)));
	console.log(filtered)

	useEffect(() => {
			setFiltered(data.filter(qn => !response.includes(qn.id)))
  }, [response]);

	return (
		<View
			style={{
				flex: 1,
				flexDirection: "column",
				justifyContent: "start",
				alignItems: "center",
				padding: 20,
			}}
		>
			<View
				style={{
						flexDirection: "row",
						width:"90%",
						maxWidth:600,
						justifyContent: "start",
						paddingBottom: 10
				}}>
					<Button 
						title={`Hello ${clinicians.filter(c => c.id == who)[0].initials} (change)`}
						onPress={() => setWho(0)}/>
			</View>
			<ScrollView
			 style={{
				flexGrow: 1,
				flexDirection: "column",
				maxWidth:600,
				paddingBottom:100
			 }}
			 >
					{filtered.map((qn, idx) => {
							qn["clinician_id"]=who;
							return (<QuestionWrapper 
													key={idx} 
													data={qn} 
													answered={response} 
													filtered={filtered}
													setFiltered={setFiltered}
												  supabase={supabase}
											/>)
					 }) }
			</ScrollView>
		</View>
	);
}
