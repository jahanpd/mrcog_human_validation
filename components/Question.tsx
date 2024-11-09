import {Alert, Modal, Text, StyleSheet, Pressable, Button, View, ScrollView, Switch} from 'react-native';
import React, {useState, useContext, Dispatch, SetStateAction} from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { CheckBox } from '@rneui/themed';

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

type Cluster = {
		id: number,
		answers: string[],
		perplexity: number[],
		correct: boolean | null,
		setCorrect: Dispatch<SetStateAction<boolean>> | null,
		consistent: boolean | null,
		setConsistent: Dispatch<SetStateAction<boolean>> | null
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
		// get lowest perplexity answer
		let min_perp = 999999999999999999;
		let perp_answer = "";
		for (let i in params.data.perplexity) {
				if (params.data.perplexity[i] < min_perp) {
						min_perp = params.data.perplexity[i];
						perp_answer = params.data.generated_answers[i];
				}
		}

		const [modalVisible, setModalVisible] = useState(false);
		const [alertVisible, setAlertVisible] = useState(false);
<<<<<<< HEAD
		const [PerpCorrect, setPerpCorrect] = useState(false);
		const [PerpCorrectButDifferent, setPerpCorrectButDifferent] = useState(false);
=======
		const [PerpCorrect, setPerpCorrect] = useState(perp_answer === params.data.true_answer);
>>>>>>> 6f43333be27f44f1f5f2b8334408e3a8342d54ba
		const [allUnique, setAllUnique] = useState(false);


		const qid = params.data.id;
		const clinician_id = params.data.clinician_id;
		const supabase = params.supabase

		// sort answers into clusters
		const min_cluster = 0;
		const max_cluster = 12;
		let gpt_correct_group_length = 0;
		let gpt_correct_group = 99;
		const clusters: Cluster[] = [];
		for (let i = min_cluster; i <= max_cluster; i++) {
				const cluster: Cluster = {
						"id": i,
						"answers": [],
						"perplexity": [],
						"correct": null,
						"setCorrect": null,
						"consistent": null,
						"setConsistent": null
				}
				for (let j in params.data.clusters) {
						if (i == params.data.clusters[j]) {
								cluster.answers.push(params.data.generated_answers[j]);
								cluster.perplexity.push(params.data.perplexity[j]);
						}
				}
				const [clusterCorrect, setClusterCorrect] = React.useState<boolean>(false)
				const [clusterConsistent, setClusterConsistent] = React.useState<boolean>(cluster.answers.length === 1)
				cluster.correct = clusterCorrect
				cluster.setCorrect = setClusterCorrect
				cluster.consistent = clusterConsistent
				cluster.setConsistent = setClusterConsistent

				if (cluster.answers.length > 0) {
						clusters.push(cluster);
						if (cluster.answers.length > gpt_correct_group_length) {
							gpt_correct_group = cluster.id
							gpt_correct_group_length = cluster.answers.length
						}
				}
		}		




		const submitAlert = () => {
				// check if only one group correct
				// if all groups false or more than one then no correct group
				let group: number | null = null
				let clusterCorrect= false
				const group_correct_raw = clusters.map( cluster => [cluster.id, cluster.correct])
				const group_consistent_raw = clusters.map(cluster => [cluster.id, cluster.consistent])

				const number_correct = group_correct_raw.filter((val) => val[1])
				console.log(number_correct)
				
				if (number_correct.length == 1) {
						group = number_correct[0][0]
				}
				if (!group_consistent_raw.map(val => val[1]).every(el => el) ) {
						clusterCorrect = true
				}
				if (number_correct.length > 1) {
						clusterCorrect = false
				}
				
				supabase
					.from('responses_test')
					.insert({
							clinician: clinician_id, 
							question_id: qid,
							gpt_correct: PerpCorrect, // if lowest perp answer is correct
							gpt_correct_group: gpt_correct_group, // the group id of the gpt answer ie max number values
							group_correct: group, // the label of the group with the correct answers as per clinician - nullable
							group_correct_raw: JSON.stringify(group_correct_raw),
							group_consistent_raw: JSON.stringify(group_consistent_raw),
							se_clustering_correct: clusterCorrect, // are the groups correctly matched by meaning
							entailment_success: allUnique
					})
					.then(res => {
							console.log(res);
							if (res.status == 201) {
									alert("Successfully submitted");
									console.log("check push", params.answered)
									params.answered.push(qid);
									params.setFiltered(params.filtered.filter(qn => !params.answered.includes(qn.id)))
								  setAlertVisible(false);
								  setModalVisible(!modalVisible);
									setPerpCorrect(false);
									clusters.map(cluster => {
											cluster.setConsistent(false)
											cluster.setCorrect(false)
									})
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

									  <Text style={{fontWeight:"bold"}}>The True Answer:</Text>
										<Text
											style={{
													paddingBottom:10,
											}}>
										{params.data.true_answer}</Text>
										<View style={{flexDirection: "row", justifyContent:"space-between"}}>
												<View style={{flexDirection: "column"}}>
														<Text style={{fontWeight:"bold"}}>The Most Confident GPT Answer:</Text>
														<Text
															style={{
																	paddingBottom:5,
																	justifyContent: 'center', //Centered vertically
																	verticalAlign:"middle"
															}}>
														{perp_answer}</Text>
												</View>
													<CheckBox 
														containerStyle={{
															padding:5, 
															borderColor: "red", 
															borderWidth: perp_answer === params.data.true_answer ? 0 : 3}}
														checked={PerpCorrect} 
														title="Is this answer correct?" 
														disabled={perp_answer === params.data.true_answer}
														onPress={() => {
																setPerpCorrect(!PerpCorrect)
														}}
													/>
										</View>
									  <Text style={{
												fontWeight:"bold",
										}}>
										  Generated Answer Groups:</Text>
									  <Text style={{
												fontStyle:"italic"
										}}>
										  Answers are grouped by GPT according to meaning.</Text>
									  <Text style={{
												fontStyle:"italic",
										}}>
										  Please assess each group and decide if the answers in each group are:</Text>
									  <Text style={{
												fontStyle:"italic",
										}}>
										  1. All correct, and</Text>
									  <Text style={{
												fontStyle:"italic",
												paddingBottom: 10
										}}>
										  2. All have a consistent meaning</Text>
								    <ScrollView
								      style={{
														height:"100%"
												}}>
												{clusters.map((cluster, idx) => {

														const only_one = cluster.answers.length === 1

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
																					flex:1,
																					flexDirection: "column"
																			}}>
																			{cluster.answers.map( (ans, jdx) => {
																				return (
																						<Text style={{paddingBottom: 2}}key={idx + "i" + jdx}>- {ans}</Text>
																				)
																			})}
																			</View>

																			<View style={{flexDirection: "column"}}>
																					<CheckBox 
																					  containerStyle={{padding:0}}
																					  checked={cluster.correct} 
																						title="All Correct" 
																						onPress={() => {
																								cluster.setCorrect(!cluster.correct)
																						}}
																				  />
																					<CheckBox 
																					  disabled={only_one}
																					  containerStyle={{padding:0}}
																					  checked={cluster.consistent} 
																						title="Consistent Meaning" 
																						onPress={() => {
																								cluster.setConsistent(!cluster.consistent)
																						}}

																				  />
																			  
																			</View>

																	</View>
																</View>
														) })}

									  </ScrollView>
								  <View
									  style={{
												flexDirection:"column",
												justifyContent: 'space-between',
												paddingBottom:10,
												paddingTop:20
										}}
									>
										<View style={{flexDirection: "row", justifyContent:"space-between"}}>
												<View style={{flexDirection: "column"}}>
														<Text style={{fontWeight:"bold"}}>Are all groups unique?</Text>
														<Text style={{
																fontStyle:"italic",
																paddingBottom:10
														}}>
															This is false if any two or more groups have the same meaning. </Text>
												</View>
													<CheckBox 
														containerStyle={{padding:0}}
														checked={allUnique} 
														title="All Unique" 
														onPress={() => {
																setAllUnique(!allUnique)
														}}
													/>
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
												padding:5,
												margin:5,
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
