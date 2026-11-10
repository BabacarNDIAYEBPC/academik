import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { mobileSendContact } from "@workspace/api-client-react";
import { useAuth, useLanguage, errorMessage } from "@/lib/providers";
import { Screen, Card, Field, Button, Notice, Txt } from "@/components/UI";
export default function Contact() {
  const {user}=useAuth();const {t}=useLanguage();const params=useLocalSearchParams();
  const [name,setName]=useState(user?.firstName||"");const [email,setEmail]=useState(user?.email||"");const [subject,setSubject]=useState(String(params.subject||""));const [message,setMessage]=useState(String(params.message||""));const [status,setStatus]=useState("");const [busy,setBusy]=useState(false);
  return <Screen title={t("contact_title","Contacter Academik")} back><Card><Field label={t("firstname")} value={name} onChangeText={setName}/><Field label={t("email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/><Field label="Objet" value={subject} onChangeText={setSubject}/><Field label="Message" value={message} onChangeText={setMessage} multiline style={{minHeight:160,textAlignVertical:"top"}}/><Notice message={status}/><Button title="Envoyer" icon="send" busy={busy} onPress={()=>{setBusy(true);setStatus("");void mobileSendContact({name,email,subject,message}).then(()=>{setStatus("Message envoyé. Notre équipe vous répondra par e-mail.");setMessage("");}).catch(e=>setStatus(errorMessage(e))).finally(()=>setBusy(false));}}/></Card><Txt>Pour un signalement de résultat IA, précisez le problème avant l’envoi. Vérifiez que le message ne contient pas de donnée sensible.</Txt></Screen>;
}
