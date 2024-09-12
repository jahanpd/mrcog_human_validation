import { Text, View, ScrollView, Button, StyleSheet, Dimensions } from "react-native";
import clinicians from '../../assets/clinicians.json';
import Questions from './questions';
import React, {useState, useEffect} from 'react';
import SelectDropdown from 'react-native-select-dropdown'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
		"https://sftasisfcndypbsutqiv.supabase.co", 
	  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdGFzaXNmY25keXBic3V0cWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MjEyMTksImV4cCI6MjAzOTA5NzIxOX0.YtMipcRqhuAGTG4apAIWHyWEBJXuBd01LU4fv3RQuhk")

export default function Index() {
  const [who, setWho] = useState(0);
  const [response, setResponse] = useState([]);

	const getSupabase = async () => {
			const {data, error} = await supabase
						.from('responses_test')
						.select('question_id')
						.eq('clinician', who);
		  setResponse(data.map(q => q.question_id));
	}

	useEffect(() => {
    getSupabase();
  }, [who]);

	if (who == 0) {
			return (
				<View
					style={{
						flexDirection:'column' ,
						justifyContent: "start",
						alignItems: "center",
						padding: 20,
					}}
				>
				<Text
				  style={{padding:20}}>Which clinician are you??</Text>

				<SelectDropdown 
						data={clinicians}
						onSelect={(selectedItem, index) => {
								setWho(selectedItem.id)
								}}
						renderButton={(selectedItem, isOpen) => {
									return (
										<View style={styles.dropdown1ButtonStyle}>
											<Text style={styles.dropdown1ButtonTxtStyle}>
												{(selectedItem && selectedItem.initials) || 'Select Clinician'}
											</Text>
										</View>
									);
								}}
						renderItem={(item, index, isSelected) => {
									return (
										<View
											style={{
												...styles.dropdown1ItemStyle,
												...({backgroundColor: 'grey'}),
											}}>
											<Text style={styles.dropdown1ItemTxtStyle}>{item.initials}</Text>
										</View>
									);
								}}
				/>
				</View>
			)
	}

	return (
			<Questions 
			  who={who} 
				setWho={setWho} 
				response={response}
				setResponse={setResponse}
				supabase={supabase}/>
	);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 116,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 90,
    backgroundColor: '#E9ECEF',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  headerTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#151E26',
  },
  dropdownButtonStyle: {
    width: 200,
    height: 50,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
    textAlign: 'center',
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    height: 150,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
    textAlign: 'center',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  ////////////// dropdown1
  dropdown1ButtonStyle: {
    width: '80%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#444444',
  },
  dropdown1ButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dropdown1ButtonArrowStyle: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  dropdown1ButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
    color: '#FFFFFF',
  },
  dropdown1MenuStyle: {
    backgroundColor: '#444444',
    borderRadius: 8,
  },
  dropdown1ItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdown1ItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dropdown1ItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
    color: '#FFFFFF',
  },
  ////////////// dropdown2
  dropdown2ButtonStyle: {
    width: '80%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#B1BDC8',
  },
  dropdown2ButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdown2ButtonArrowStyle: {
    fontSize: 28,
  },
  dropdown2ButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdown2MenuStyle: {
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  dropdown2ItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  dropdown2ItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdown2ItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
});
