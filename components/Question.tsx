import {Alert, Modal, Text, StyleSheet, Pressable, Button, View, ScrollView, Switch} from 'react-native';
import React, {useState, useContext} from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import SelectDropdown from 'react-native-select-dropdown';

type Data = {
		question: string,
		id: string,
		clinician_id: string,
		clusters: number[],
		perplexity: number[],
		generated_answers: string[],
		true_answer: string,
}

type Params = {
    data: Data,
		supabase: SupabaseClient,
		answered: [],
		filtered: [],
		setFiltered: any
}

const colors = {
	"lime":"#65a30d",
	"teal":"#115e59",
	"zinc": "#52525b",
	"sky":"#0284c7",
	"purple":"#9333ea",
	"amber":"#d97706",
  "red": "#dc2626",
	"pink":"#be185d",
	"fuschia":"#c026d3",
	"rose":"#e11d48"
}

const color_keys = Object.keys(colors);

export function QuestionWrapper(params: Params) {
		const [modalVisible, setModalVisible] = useState(false);
		const [alertVisible, setAlertVisible] = useState(false);
		const [seCorrect, setSECorrect] = useState(-1);
		const [clusterCorrect, setClusterCorrect] = useState(false);
		const [PerpCorrect, setPerpCorrect] = useState(false);


		const qid = params.data.id;
		const clinician_id = params.data.clinician_id;
		const supabase = params.supabase

		// sort answers into clusters
		const min_cluster = Math.min(...params.data.clusters);
		const max_cluster = Math.max(...params.data.clusters);
		const clusters = [];
		for (let i = min_cluster; i <= max_cluster; i++) {
				const cluster = {
						"id": i,
						"answers": [],
						"perplexity": []
				}
				for (let j in params.data.clusters) {
						if (i == params.data.clusters[j]) {
								cluster.answers.push(params.data.generated_answers[j]);
								cluster.perplexity.push(params.data.perplexity[j]);
						}
				}
				if (cluster.answers.length > 0) {
						clusters.push(cluster);
				}
		}

		clusters.sort((a, b) => b.answers.length - a.answers.length)

		// get lowest perplexity answer
		let min_perp = 99999999999999;
		let perp_answer = "";
		let gpt_correct_group = clusters[0].id;
		for (let i in clusters[0].perplexity) {
				if (clusters[0].perplexity[i] < min_perp) {
						min_perp = clusters[0].perplexity[i];
						perp_answer = clusters[0].answers[i];
				}
		}

		const submitAlert = () => {
				console.log("group", seCorrect)
				if (seCorrect < 0) {
						alert("Choose a Group!");
						return
				}
				supabase
					.from('responses_test')
					.insert({
							clinician: clinician_id, 
							question_id: qid,
							gpt_correct: PerpCorrect, // if lowest perp answer in largest group correct
							gpt_correct_group: gpt_correct_group, // the group id of the gpt answer
							group_correct: seCorrect, // the label of the group with the most correct answers
							se_clustering_correct: clusterCorrect // are the groups correctly matched by meaning
					})
					.then(res => {
							console.log(res);
							if (res.status == 201) {
									alert("Successfully submitted");
									console.log("check push", params.answered)
									params.answered.push(qid);
									params.setFiltered(params.filtered.filter(qn => !params.answered.includes(qn.id)))
									setSECorrect(-1);
								  setAlertVisible(false);
								  setModalVisible(!modalVisible);
									console.log(params.answered)
									console.log(params.filtered)
							} else {
									alert(res.error.message)
							}
					});
				// remove this question from the list

				console.log(params.answered);
				
		}

		return (
				<View style={{
						flex: 1,
				}}>
				  <Modal
						animationType="slide"
						transparent={false}
						visible={modalVisible}
						onRequestClose={() => {
							Alert.alert('Modal has been closed.');
							setModalVisible(!modalVisible);
						}}>
						  <View
							  style={{
								flex: 1,
								flexDirection: "column",
								justifyContent: "start",
								alignItems: "center",
								paddingTop: 60,
								paddingHorizontal: 20
						  	}}
					  	>
							  <View
								  style={{
											maxWidth:600,
											height:"100%",
											padding:0
									}}>
									  <Text style={{fontWeight:"bold"}}>Question:</Text>
										<Text
										  style={{
													paddingBottom:5
											}}
										>{params.data.question}</Text>

									  <Text style={{fontWeight:"bold"}}>Correct Answer:</Text>
										<Text
											style={{
													paddingBottom:5
											}}>
										{params.data.true_answer}</Text>
									  <Text style={{fontWeight:"bold"}}>GPT Answer:</Text>
										<Text
											style={{
													paddingBottom:5
											}}>
										{perp_answer}</Text>
									  <Text style={{
												fontWeight:"bold",
										}}>
										  Generated Answers:</Text>
									  <Text style={{
												fontStyle:"italic"
										}}>
										  Grouped by semantic meaning, AND</Text>
									  <Text style={{
												fontStyle:"italic",
												paddingBottom:10
										}}>
										  Ranked by group size (largest/top -> smallest/bottom)</Text>
								    <ScrollView
								      style={{
														height:"100%"
												}}>
												{clusters.map((cluster, idx) => {
														return (
																<View style={{
																		marginBottom:20,
																		borderWidth: 2,
																		padding: 2,
																		borderColor: colors[color_keys[idx]]
																}} key={idx}>
																  <View style={{
																			flex: 1,
																			flexDirection: "row"
																	}}>
																	    <Text style={{paddingRight:10, fontWeight:"bold"}}>Group {cluster.id}:</Text>
																			<View style={{
																					flexDirection: "column"
																			}}>
																			{cluster.answers.map( (ans, jdx) => {
																				return (
																						<Text style={{paddingBottom: 2}}key={idx + "i" + jdx}>- {ans}</Text>
																				)
																			})}
																			</View>
																	</View>
																</View>
														) })}

									  </ScrollView>
								  <View
									  style={{
												flexDirection:"column",
												justifyContent: 'space-between',
												paddingBottom:10
										}}
									>
									  <View 
												style={{
														flexDirection:"row",
														paddingBottom:5
										}}
										>
												<Text style={{fontWeight:"bold", width:"80%", paddingRight: 20}}>GPT answer is correct</Text>
												<Switch 
													value={PerpCorrect} 
													onValueChange={() => setPerpCorrect(!PerpCorrect)}/>
										</View>
									  <View 
												style={{
														flexDirection:"row",
														paddingBottom:5
										}}
										>
												<Text style={{fontWeight:"bold", width:"80%", paddingRight: 20}}>Which group contains the most correct answers :</Text>
													<SelectDropdown 
													data={clusters}
							  					onSelect={(selectedItem, index) => {
														setSECorrect(selectedItem.id)
														}}
												  renderButton={(selectedItem, isOpen) => {
																	return (
																		<View style={styles.dropdown1ButtonStyle}>
																			<Text style={styles.dropdown1ButtonTxtStyle}>
																				{(selectedItem && `${selectedItem.id}`) || 'Select Group'}
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
																	<Text style={styles.dropdown1ItemTxtStyle}>{item.id}</Text>
																</View>
															);
														}}
													/>
										</View>
									  <View 
												style={{
														flexDirection:"row",
														paddingBottom:5
										}}
										>
												<Text style={{fontWeight:"bold", width:"80%", paddingRight: 20}}>Each Group Contains Answers with the Same Meaning:</Text>
												<Switch 
													value={clusterCorrect} 
													onValueChange={() => setClusterCorrect(!clusterCorrect)}/>
										</View>
									</View>
									<View 
									  style={{
												flexDirection:"row",
												justifyContent: 'space-between',
												paddingBottom:40
										}}>
											<Button
													title="Close Question"
													onPress={() => setModalVisible(!modalVisible)} />
										{alertVisible ?
										<>
											<Button
													title="COMMIT ANSWER"
													color="#dc2626"
													onPress={() => submitAlert()} />
											<Button
													title="KEEP EDITING"
													color="#65a30d"
													onPress={() => setAlertVisible(false)} />
										</>
													:
											<Button
													title="Submit Response"
													color="#f194ff"
													onPress={() => setAlertVisible(true)} /> }
									</View>
								</View>


						  </View>
					  </Modal>
						<Pressable
									onPress={() => setModalVisible(!modalVisible)}>
									<View
									  style={{
												flexDirection:"row",
												borderWidth:1,
												margin:5,
												padding:5,
												width:"90%",
												height:40
										}}>
												<Text
													style={{
															paddingRight:10
													}}>
													{params.data.id}
												</Text>

												<Text
													numberOfLines={1}
													style={{
															width:"90%"
													}}>
												{params.data.question}
												</Text>
									</View>
						</Pressable>
				</View>
		)
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
    width: '30%',
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
